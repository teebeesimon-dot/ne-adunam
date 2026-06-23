// Creates a test event in Firestore owned by the test user, with pricing,
// so v0 can verify the event page UI. Prints the event id.
//
// Usage: SERVICE_ACCOUNT_FILE=path.json node scripts/create-test-event.mjs

import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const rawKey = process.env.SERVICE_ACCOUNT_FILE
  ? readFileSync(process.env.SERVICE_ACCOUNT_FILE, "utf8")
  : (process.env.FIREBASE_SERVICE_ACCOUNT ?? "");
const sa = JSON.parse(rawKey || "{}");
if (!sa.private_key) {
  console.error("Service account is missing or invalid");
  process.exit(1);
}

const PROJECT = sa.project_id;
const OWNER = process.env.TEST_UID || "v0-test-user";

function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function signRS256(s) {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(s);
  return signer.sign(sa.private_key).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: sa.token_uri, iat: now, exp: now + 3600,
  }));
  const jwt = `${header}.${claim}.${signRS256(`${header}.${claim}`)}`;
  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json.access_token;
}

async function main() {
  const token = await getAccessToken();
  const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const fields = {
    title: { stringValue: "Fotbal de test (v0)" },
    sport: { stringValue: "football" },
    date: { stringValue: inTwoDays },
    time: { stringValue: "19:00" },
    durationMinutes: { integerValue: "90" },
    pricePerHour: { integerValue: "200" },
    location: { stringValue: "Teren Sintetic Central" },
    maxParticipants: { integerValue: "10" },
    ownerId: { stringValue: OWNER },
    createdAt: { timestampValue: new Date().toISOString() },
  };
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/events`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  const id = json.name.split("/").pop();
  console.log("EVENT_ID=" + id);
}

main().catch((e) => { console.error(e.message); process.exit(1); });

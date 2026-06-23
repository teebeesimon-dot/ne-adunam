// Creates (or updates) a test user document in Firestore and mints a Firebase
// custom token so v0 can sign in during local verification.
//
// Usage:
//   SERVICE_ACCOUNT_FILE=path.json node scripts/create-test-user.mjs
//   node --env-file=/vercel/share/.env.project scripts/create-test-user.mjs
//
// Optional env: TEST_UID, TEST_EMAIL, TEST_NAME, TEST_ROLE (user|organizer|super_admin)

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
const UID = process.env.TEST_UID || "v0-test-user";
const EMAIL = process.env.TEST_EMAIL || "v0-test@ne-adunam.app";
const NAME = process.env.TEST_NAME || "Cont Test v0";
const ROLE = process.env.TEST_ROLE || "organizer";

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signRS256(signingInput) {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  return signer
    .sign(sa.private_key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );
  const jwt = `${header}.${claim}.${signRS256(`${header}.${claim}`)}`;
  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`token: ${JSON.stringify(json)}`);
  return json.access_token;
}

function mintCustomToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud:
        "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      iat: now,
      exp: now + 3600,
      uid: UID,
    })
  );
  return `${header}.${payload}.${signRS256(`${header}.${payload}`)}`;
}

async function upsertUserDoc(accessToken) {
  const now = new Date().toISOString();
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users/${UID}`;
  const body = {
    fields: {
      uid: { stringValue: UID },
      displayName: { stringValue: NAME },
      email: { stringValue: EMAIL },
      role: { stringValue: ROLE },
      createdAt: { timestampValue: now },
    },
  };
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`firestore: ${JSON.stringify(json)}`);
}

async function main() {
  const accessToken = await getAccessToken();
  await upsertUserDoc(accessToken);
  const customToken = mintCustomToken();
  console.log(`Test user ready: ${NAME} <${EMAIL}> role=${ROLE} uid=${UID}`);
  console.log("CUSTOM_TOKEN_START");
  console.log(customToken);
  console.log("CUSTOM_TOKEN_END");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

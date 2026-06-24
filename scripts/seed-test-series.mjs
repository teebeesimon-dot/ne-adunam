// Seeds a test series + 3 occurrences (1 past, 1 current/upcoming, 1 future)
// directly via Firestore REST using the service account. Used to verify the
// series UI (home grouping, history, monthly subscription panel) end-to-end.
//
// Usage: SERVICE_ACCOUNT_FILE=.sa-tmp.json node scripts/seed-test-series.mjs
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

const saPath = process.env.SERVICE_ACCOUNT_FILE;
if (!saPath) {
  console.error("Set SERVICE_ACCOUNT_FILE to the service account JSON path.");
  process.exit(1);
}
const sa = JSON.parse(readFileSync(saPath, "utf8"));
const PROJECT = sa.project_id;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const b64url = (s) =>
  Buffer.from(s).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );
  const sig = crypto
    .createSign("RSA-SHA256")
    .update(`${header}.${claim}`)
    .sign(sa.private_key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const jwt = `${header}.${claim}.${sig}`;
  return fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })
    .then((r) => r.json())
    .then((j) => j.access_token);
}

// Firestore typed-value helpers.
const S = (stringValue) => ({ stringValue });
const I = (n) => ({ integerValue: String(n) });
const T = (iso) => ({ timestampValue: iso });

function isoDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const token = await accessToken();
  const auth = { Authorization: `Bearer ${token}` };
  const OWNER = "v0-test-user";
  const seriesId = `v0-seed-series-${Date.now()}`;

  const past = isoDate(-7);
  const current = isoDate(3);
  const future = isoDate(10);

  const common = {
    title: S("Fotbal de seară (serie test)"),
    sport: S("fotbal"),
    time: S("19:00"),
    durationMinutes: I(90),
    maxParticipants: I(10),
    location: S("Arena Test, București"),
    ownerId: S(OWNER),
    seriesId: S(seriesId),
    paymentModel: S("monthly"),
  };

  async function putEvent(id, date, occurrenceDate) {
    const fields = {
      ...common,
      date: S(date),
      occurrenceDate: S(occurrenceDate),
      createdAt: T(new Date().toISOString()),
    };
    const res = await fetch(`${BASE}/events?documentId=${id}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    console.log(`event ${id} (${date}):`, res.status);
  }

  const pastId = `${seriesId}_past`;
  const currentId = `${seriesId}_current`;
  const futureId = `${seriesId}_future`;

  await putEvent(pastId, past, past);
  await putEvent(currentId, current, current);
  await putEvent(futureId, future, future);

  // Series doc points at the current (upcoming) occurrence.
  const seriesFields = {
    title: S("Fotbal de seară (serie test)"),
    sport: S("fotbal"),
    time: S("19:00"),
    durationMinutes: I(90),
    maxParticipants: I(10),
    location: S("Arena Test, București"),
    ownerId: S(OWNER),
    frequency: S("weekly"),
    startDate: S(past),
    endDate: { nullValue: null },
    status: S("active"),
    paymentModel: S("monthly"),
    monthlyPrice: I(150),
    currentEventId: S(currentId),
    currentOccurrenceDate: S(current),
    createdAt: T(new Date().toISOString()),
  };
  const sres = await fetch(`${BASE}/series?documentId=${seriesId}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: seriesFields }),
  });
  console.log(`series ${seriesId}:`, sres.status);

  console.log("\nSEED_SERIES_ID=" + seriesId);
  console.log("CURRENT_EVENT_ID=" + currentId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Adds domains to Firebase Authentication's authorized domains list.
// Usage:
//   node --env-file=/vercel/share/.env.project scripts/add-authorized-domains.mjs domain1 [domain2 ...]
//   SERVICE_ACCOUNT_FILE=key.json node scripts/add-authorized-domains.mjs domain1 [domain2 ...]
//
// Uses the Identity Toolkit Admin API (GET/PATCH the project config) with an
// OAuth2 access token minted from the service account private key.

import crypto from "node:crypto";
import { readFileSync } from "node:fs";

let rawKey = process.env.SERVICE_ACCOUNT_FILE
  ? readFileSync(process.env.SERVICE_ACCOUNT_FILE, "utf8")
  : (process.env.FIREBASE_SERVICE_ACCOUNT ?? "");

// The value may have been pasted wrapped in single or double quotes.
rawKey = rawKey.trim();
if (
  (rawKey.startsWith("'") && rawKey.endsWith("'")) ||
  (rawKey.startsWith('"') && rawKey.endsWith('"') && !rawKey.startsWith('"{'))
) {
  rawKey = rawKey.slice(1, -1);
}

const sa = JSON.parse(rawKey || "{}");
if (!sa.private_key) {
  console.error("Service account is missing or invalid");
  process.exit(1);
}
// Some env-stored keys have literal "\n" sequences instead of real newlines.
if (sa.private_key.includes("\\n")) {
  sa.private_key = sa.private_key.replace(/\\n/g, "\n");
}

const PROJECT = sa.project_id;
const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

const domainsToAdd = process.argv.slice(2).map((d) => d.trim()).filter(Boolean);
if (domainsToAdd.length === 0) {
  console.error("No domains provided. Pass one or more domains as arguments.");
  process.exit(1);
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claim}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = signer
    .sign(sa.private_key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const jwt = `${signingInput}.${signature}`;

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

async function main() {
  const token = await getAccessToken();
  const auth = { Authorization: `Bearer ${token}` };
  const configUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config`;

  // 1. Read current config
  const getRes = await fetch(configUrl, { headers: auth });
  const config = await getRes.json();
  if (!getRes.ok) throw new Error(`get config: ${JSON.stringify(config)}`);

  const current = config.authorizedDomains ?? [];
  console.log("Current authorized domains:", current.join(", "));

  const merged = Array.from(new Set([...current, ...domainsToAdd]));
  const added = merged.filter((d) => !current.includes(d));

  if (added.length === 0) {
    console.log("Nothing to add — all domains are already authorized.");
    return;
  }

  // 2. Patch authorizedDomains
  const patchRes = await fetch(
    `${configUrl}?updateMask=authorizedDomains`,
    {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ authorizedDomains: merged }),
    }
  );
  const updated = await patchRes.json();
  if (!patchRes.ok) throw new Error(`patch config: ${JSON.stringify(updated)}`);

  console.log("Added:", added.join(", "));
  console.log("New authorized domains:", updated.authorizedDomains.join(", "));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

import { writeFile } from "node:fs/promises";
import { hash } from "bcryptjs";
import { SignJWT } from "jose";

const now = "2026-10-29T17:00:00.000Z";
const issuedAt = Date.parse(now) / 1000;
const key = new Uint8Array(32).fill(19);
const password = "synthetic-spike-password";
const claims = { id_user: 1, role: "teknisi", role_id: 4 };
const token = await new SignJWT(claims)
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setIssuedAt(issuedAt)
  .setExpirationTime(issuedAt + 60)
  .sign(key);

await writeFile(
  new URL("./reference.json", import.meta.url),
  JSON.stringify(
    {
      provenance: "Synthetic fixture generated with Node; no production data",
      nodeVersion: process.versions.node,
      now,
      key: Array.from(key),
      claims,
      token,
      password,
      hash: await hash(password, "$2b$04$abcdefghijklmnopqrstuu"),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Synthetic reference generated on Node ${process.versions.node}`);

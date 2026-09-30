import type { Config } from "drizzle-kit";

// Keep this in sync with src/lib/db/index.ts, which reads the same env vars
// at runtime. Locally (no TURSO_AUTH_TOKEN), this pushes straight to the
// sqlite file at DATABASE_URL. Against a Turso database, set DATABASE_URL to
// its libsql:// URL and TURSO_AUTH_TOKEN to its auth token — same command,
// `npx drizzle-kit push`, either way. See README.md "Deploying for free".
const rawUrl = process.env.DATABASE_URL ?? "file:./sundays.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export default (authToken
  ? {
      schema: "./src/lib/db/schema.ts",
      out: "./drizzle",
      dialect: "turso",
      dbCredentials: { url: rawUrl, authToken },
    }
  : {
      schema: "./src/lib/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: { url: rawUrl.startsWith("file:") ? rawUrl.slice("file:".length) : rawUrl },
    }) satisfies Config;

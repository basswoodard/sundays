import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

// @libsql/client speaks both local sqlite files (url: "file:...") and a
// hosted Turso database (url: "libsql://...", with an authToken) through the
// exact same client — so local dev keeps using a plain file with zero setup,
// and production points at Turso's free tier by just changing env vars. See
// README.md "Deploying for free" for the Vercel + Turso walkthrough.
const rawUrl = process.env.DATABASE_URL ?? "file:./sundays.db";

// turbopackIgnore: the file: path below is a local sqlite file, not an app
// source file — it must NOT be traced/bundled into the server output (that
// would sweep the whole project, including public/, into the deploy
// artifact). Irrelevant once DATABASE_URL points at a libsql:// Turso URL.
const url = rawUrl.startsWith("file:")
  ? "file:" + path.resolve(/* turbopackIgnore: true */ process.cwd(), rawUrl.slice("file:".length))
  : rawUrl;

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// SQLite (and libsql) default to foreign-key enforcement OFF per connection;
// the schema relies on ON DELETE CASCADE, so this must run before any query.
await client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle(client, { schema });
export { client };

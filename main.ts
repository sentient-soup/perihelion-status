// main.ts
import { serveStatic } from "hono/deno";
import { createApp } from "./src/routes.ts";
import { startScheduler } from "./src/scheduler.ts";
import { PORT } from "./src/config.ts";

const kvPath = Deno.env.get("DENO_KV_PATH") ?? undefined;
const kv = await Deno.openKv(kvPath);

// Start background health checks
startScheduler(kv);

// Create Hono app with routes
const app = createApp(kv);

// Serve static files (CSS)
app.use("/static/*", serveStatic({ root: "./" }));

console.log(`Status page running on http://localhost:${PORT}`);
Deno.serve({ port: PORT }, app.fetch);

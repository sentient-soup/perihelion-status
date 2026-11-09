// src/routes.ts
import { Hono } from "hono";
import { services } from "./config.ts";
import {
  computeOverallUptime,
  getLiveStatus,
  getServiceHistory,
} from "./store.ts";
import { servicesPartial, statusPage } from "./views/status-page.ts";
import type { ServiceData } from "./views/status-page.ts";
import { directory } from "./directory.ts";
import { startPage } from "./views/guide-pages.ts";
import type { DirectoryItem } from "./views/guide-pages.ts";

export function createApp(kv: Deno.Kv): Hono {
  const app = new Hono();

  /** Gather data for all services */
  async function gatherServiceData(): Promise<ServiceData[]> {
    const now = new Date();
    const result: ServiceData[] = [];

    for (const svc of services) {
      const [history, live] = await Promise.all([
        getServiceHistory(kv, svc.id, now),
        getLiveStatus(kv, svc.id),
      ]);
      const uptime = computeOverallUptime(history);
      result.push({ config: svc, history, uptime, live });
    }

    return result;
  }

  // Full page
  app.get("/", async (c) => {
    const data = await gatherServiceData();
    return c.html(statusPage(data));
  });

  // User-facing onboarding guide. Live status only for entries monitored in services.json.
  async function gatherDirectory(): Promise<DirectoryItem[]> {
    const monitored = new Set(services.map((s) => s.id));
    return await Promise.all(directory.map(async (entry) => ({
      entry,
      live: monitored.has(entry.statusId)
        ? await getLiveStatus(kv, entry.statusId)
        : undefined,
    })));
  }

  app.get("/start", async (c) => c.html(startPage(await gatherDirectory())));

  // htmx partial — just the service rows
  app.get("/partials/services", async (c) => {
    const data = await gatherServiceData();
    return c.html(servicesPartial(data));
  });

  return app;
}

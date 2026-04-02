// src/routes.ts
import { Hono } from "hono";
import { services } from "./config.ts";
import { computeOverallUptime, getServiceHistory } from "./store.ts";
import { servicesPartial, statusPage } from "./views/status-page.ts";
import type { ServiceData } from "./views/status-page.ts";

export function createApp(kv: Deno.Kv): Hono {
  const app = new Hono();

  /** Gather data for all services */
  async function gatherServiceData(): Promise<ServiceData[]> {
    const now = new Date();
    const result: ServiceData[] = [];

    for (const svc of services) {
      const history = await getServiceHistory(kv, svc.id, now);
      const uptime = computeOverallUptime(history);
      result.push({ config: svc, history, uptime });
    }

    return result;
  }

  // Full page
  app.get("/", async (c) => {
    const data = await gatherServiceData();
    return c.html(statusPage(data));
  });

  // htmx partial — just the service rows
  app.get("/partials/services", async (c) => {
    const data = await gatherServiceData();
    return c.html(servicesPartial(data));
  });

  return app;
}

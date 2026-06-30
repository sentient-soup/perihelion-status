// src/views/status-page.ts
import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { ServiceConfig } from "../config.ts";
import type { DayStats, LiveStatus } from "../store.ts";
import { computeOverallUptime, countNines } from "../store.ts";
import { layout } from "./layout.ts";
import { liveRegion, masthead } from "./components.ts";

export interface ServiceData {
  config: ServiceConfig;
  history: DayStats[];
  uptime: number;
  live: LiveStatus | null;
}

function ninesDisplay(globalUptime: number): string {
  const nines = countNines(globalUptime);
  return isFinite(nines) ? (Math.floor(nines * 10) / 10).toFixed(1) : "> 9000";
}

export function statusPage(
  servicesData: ServiceData[],
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const globalUptime = computeOverallUptime(
    servicesData.flatMap((s) => s.history),
  );

  return layout(
    "Perihelion Status",
    html`
      <div class="sheet">
        ${masthead()}
        <main
          class="live-region"
          hx-get="/partials/services"
          hx-trigger="every 30s"
          hx-swap="innerHTML"
        >
          ${liveRegion(servicesData, globalUptime, ninesDisplay(globalUptime))}
        </main>
        <div class="colophon">
          <div class="small">
            Monitored from Aphelion · checks every 60s · last 90 days
          </div>
        </div>
      </div>
    `,
  );
}

/** Partial: the live region (for htmx polling) */
export function servicesPartial(
  servicesData: ServiceData[],
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const globalUptime = computeOverallUptime(
    servicesData.flatMap((s) => s.history),
  );
  return liveRegion(servicesData, globalUptime, ninesDisplay(globalUptime));
}

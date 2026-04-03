// src/views/status-page.ts
import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { ServiceConfig } from "../config.ts";
import type { DayStats } from "../store.ts";
import { computeOverallUptime, countNines, ninesLabel } from "../store.ts";
import { layout } from "./layout.ts";
import { pageHeader, serviceRow } from "./components.ts";

export interface ServiceData {
  config: ServiceConfig;
  history: DayStats[];
  uptime: number;
}

export function statusPage(
  servicesData: ServiceData[],
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const allHistory = servicesData.flatMap((s) => s.history);
  const globalUptime = computeOverallUptime(allHistory);
  const nines = countNines(globalUptime);
  const grade = ninesLabel(nines);

  const rows = servicesData.map((s) =>
    serviceRow(s.config.name, s.history, s.uptime)
  );

  return layout(
    "Perihelion Status",
    html`
      <div class="container">
        ${pageHeader(globalUptime, nines, grade)}
        <main
          class="services"
          hx-get="/partials/services"
          hx-trigger="every 30s"
          hx-swap="innerHTML"
        >
          ${rows}
        </main>
        <footer>
          <p>
            Monitored from Aphelion &middot; Checks every 60s &middot; Last 90 days
          </p>
          <p class="footer-note">
            "Five nines" is a goal, not a promise.
          </p>
        </footer>
      </div>
    `,
  );
}

/** Partial: just the service rows (for htmx polling) */
export function servicesPartial(
  servicesData: ServiceData[],
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const rows = servicesData.map((s) =>
    serviceRow(s.config.name, s.history, s.uptime)
  );
  return html`
    ${rows}
  `;
}

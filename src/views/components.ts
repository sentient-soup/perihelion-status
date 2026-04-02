// src/views/components.ts
import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { DayStats } from "../store.ts";

/** Determine CSS class for a single day bar */
export function barColor(uptimePercent: number): string {
  if (uptimePercent === 0) return "bar-nodata";
  if (uptimePercent >= 99) return "bar-up";
  if (uptimePercent >= 90) return "bar-degraded";
  return "bar-down";
}

/** Determine CSS class for the uptime badge */
export function uptimeBadgeClass(uptimePercent: number): string {
  if (uptimePercent >= 99) return "badge-up";
  if (uptimePercent >= 90) return "badge-degraded";
  return "badge-down";
}

/** Render the 90-day bar strip for a service */
export function barStrip(history: DayStats[]): HtmlEscapedString | Promise<HtmlEscapedString> {
  const bars = history.map((d) => {
    const cls = barColor(d.uptimePercent);
    const title = d.total === 0
      ? `${d.day}: No data`
      : `${d.day}: ${d.uptimePercent.toFixed(2)}% uptime (${d.ok}/${d.total} checks)`;
    return `<div class="bar ${cls}" title="${title}"></div>`;
  }).join("");

  return html`<div class="bar-strip">${raw(bars)}</div>`;
}

/** Render a single service row */
export function serviceRow(
  name: string,
  history: DayStats[],
  overallUptime: number,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const badgeCls = overallUptime === 0
    ? "badge-nodata"
    : uptimeBadgeClass(overallUptime);
  const badgeText = overallUptime === 0
    ? "No data"
    : `${overallUptime.toFixed(3)}%`;

  return html`<div class="service-row">
  <div class="service-header">
    <span class="service-name">${name}</span>
    <span class="badge ${badgeCls}">${badgeText}</span>
  </div>
  ${barStrip(history)}
  <div class="bar-labels">
    <span>${history[0]?.day ?? ""}</span>
    <span>Today</span>
  </div>
</div>`;
}

/** Render the page header with overall uptime */
export function pageHeader(
  overallUptime: number,
  ninesStr: string,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const statusText = overallUptime >= 99
    ? "All Systems Operational"
    : overallUptime >= 90
      ? "Degraded Performance"
      : overallUptime > 0
        ? "Major Outage"
        : "No Data Yet";

  const statusCls = overallUptime >= 99
    ? "status-up"
    : overallUptime >= 90
      ? "status-degraded"
      : overallUptime > 0
        ? "status-down"
        : "status-nodata";

  return html`<header class="page-header">
  <h1>Perihelion Status</h1>
  <div class="overall-status ${statusCls}">
    <span class="status-dot"></span>
    <span>${statusText}</span>
  </div>
  <div class="overall-uptime">
    <span class="nines">${ninesStr}</span>
    <span class="uptime-label">over the last 90 days</span>
  </div>
</header>`;
}

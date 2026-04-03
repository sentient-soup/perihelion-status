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

/** Format a date string nicely: "2026-04-02" → "Apr 2" */
function shortDate(day: string): string {
  const d = new Date(day + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Render the 90-day bar strip for a service */
export function barStrip(
  history: DayStats[],
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const bars = history
    .map((d) => {
      const cls = barColor(d.uptimePercent);
      const dateLabel = shortDate(d.day);

      if (d.total === 0) {
        return `<div class="bar ${cls}" data-tooltip="${dateLabel}&#10;No data"></div>`;
      }

      const pct = d.uptimePercent.toFixed(2);
      return `<div class="bar ${cls}" data-tooltip="${dateLabel}&#10;${pct}% uptime&#10;${d.ok}/${d.total} checks passed"></div>`;
    })
    .join("");

  return html`
    <div class="bar-strip">${raw(bars)}</div>
  `;
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

  return html`
    <div class="service-row">
      <div class="service-header">
        <span class="service-name">${name}</span>
        <span class="badge ${badgeCls}">${badgeText}</span>
      </div>
      ${barStrip(history)}
      <div class="bar-labels">
        <span>${history[0]?.day ?? ""}</span>
        <span>Today</span>
      </div>
    </div>
  `;
}

/** Pick a fun status message and class based on uptime */
function statusInfo(uptimePercent: number): {
  text: string;
  cls: string;
} {
  if (uptimePercent >= 99) {
    return { text: "All Systems Operational", cls: "status-up" };
  }
  if (uptimePercent >= 90) {
    return { text: "Mostly Operational, Mostly", cls: "status-degraded" };
  }
  if (uptimePercent > 0) {
    return { text: "This Is Fine", cls: "status-down" };
  }
  return { text: "Waiting for Data...", cls: "status-nodata" };
}

/** Render the page header with overall uptime */
export function pageHeader(
  uptimePercent: number,
  ninesCount: number,
  ninesGrade: string,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const { text: statusText, cls: statusCls } = statusInfo(uptimePercent);
  const ninesDisplay = isFinite(ninesCount)
    ? (Math.floor(ninesCount * 10) / 10).toFixed(1)
    : "> 9000";
  const uptimeDisplay = uptimePercent > 0
    ? `${uptimePercent.toFixed(4)}%`
    : "\u2014";

  return html`
    <header class="page-header">
      <div class="header-bg">
        <div class="header-content">
          <h1 class="site-title">Perihelion Status</h1>
          <p class="subtitle">homelab uptime, measured with questionable rigor</p>

          <div class="hero-stats">
            <div class="stat-block nines-block">
              <span class="stat-value">${ninesDisplay}</span>
              <span class="stat-label">nines</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-block">
              <span class="stat-value stat-uptime">${uptimeDisplay}</span>
              <span class="stat-label">uptime</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-block">
              <span class="stat-value stat-grade">${ninesGrade ||
                "\u2014"}</span>
              <span class="stat-label">grade</span>
            </div>
          </div>

          <div class="overall-status ${statusCls}">
            <span class="status-dot"></span>
            <span>${statusText}</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

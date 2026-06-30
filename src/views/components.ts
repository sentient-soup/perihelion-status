// src/views/components.ts
import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { DayStats, LiveStatus } from "../store.ts";
import type { ServiceData } from "./status-page.ts";

/** Determine CSS class for a single history-day bar */
export function barColor(uptimePercent: number): string {
  if (uptimePercent === 0) return "bar-nodata";
  if (uptimePercent >= 99) return "bar-up";
  if (uptimePercent >= 90) return "bar-degraded";
  return "bar-down";
}

/** Current up/down state for a service, from its latest check. */
type LiveState = "up" | "down" | "nodata";
function liveState(live: LiveStatus | null): LiveState {
  if (!live) return "nodata";
  return live.ok ? "up" : "down";
}

const STATE_WORD: Record<LiveState, string> = {
  up: "Online",
  down: "Offline",
  nodata: "Awaiting first check",
};

/** Format a date string nicely: "2026-04-02" → "Apr 2" */
function shortDate(day: string): string {
  const d = new Date(day + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Join names into readable prose: ["A","B","C"] → "A, B and C" */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
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

/** The static masthead — title block at the top of the page. */
export function masthead(): HtmlEscapedString | Promise<HtmlEscapedString> {
  return html`
    <header class="masthead">
      <div class="kicker">Perihelion</div>
      <h1>System Status</h1>
      <div class="dateline">
        Homelab service monitoring
      </div>
    </header>
  `;
}

/** The "right now" verdict, written as a sentence from current service state. */
function lede(
  servicesData: ServiceData[],
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const down = servicesData
    .filter((s) => !s.live?.ok)
    .map((s) => s.config.name);
  const allUp = down.length === 0;

  const markText = allUp ? "Operational" : "Service disruption";
  const sentence = allUp
    ? html`All systems operational.`
    : html`<em>${joinNames(down)}</em>
        ${down.length > 1 ? "are" : "is"} currently down.`;

  return html`
    <div class="lede ${allUp ? "" : "warn"}">
      <span class="mark"><span class="dot"></span>${markText}</span>
      <p>${sentence}</p>
    </div>
  `;
}

/** The quiet "field notes" stats: historical averages, demoted below the verdict. */
function fieldNotes(
  globalUptime: number,
  ninesDisplay: string,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const uptimeText = globalUptime > 0
    ? `${globalUptime.toFixed(2)}%`
    : "—";
  return html`
    <div class="notes">
      <div class="n"><b>${uptimeText}</b>90-day uptime</div>
      <div class="n"><b>${ninesDisplay}</b>nines</div>
      <div class="n"><b>60s</b>check interval</div>
    </div>
  `;
}

/** Render a single service as an almanac index entry. */
function entry(
  s: ServiceData,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const state = liveState(s.live);
  const uptimeText = s.uptime > 0 ? `${s.uptime.toFixed(2)}% up` : "no data yet";
  const detail = state === "up" && s.live
    ? `${s.live.latencyMs} ms · ${uptimeText}`
    : state === "down"
    ? `offline · ${uptimeText}`
    : "awaiting first check";

  const firstDay = s.history[0]?.day;
  return html`
    <article class="entry">
      <div class="top">
        <span class="status ${state}"></span>
        <span class="nm">${s.config.name}</span>
        <span class="now ${state}">· ${STATE_WORD[state]}</span>
        <span class="dots">${detail}</span>
      </div>
      ${barStrip(s.history)}
      <div class="scale">
        <span>${firstDay ? shortDate(firstDay) : ""}</span>
        <span>Today</span>
      </div>
    </article>
  `;
}

/**
 * The live region: verdict + field notes + the service index.
 * Re-rendered on the htmx poll so the "right now" status stays current.
 */
export function liveRegion(
  servicesData: ServiceData[],
  globalUptime: number,
  ninesDisplay: string,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  return html`
    ${lede(servicesData)}
    ${fieldNotes(globalUptime, ninesDisplay)}
    <section class="index">
      <h2>Monitored Services</h2>
      ${servicesData.map((s) => entry(s))}
    </section>
  `;
}

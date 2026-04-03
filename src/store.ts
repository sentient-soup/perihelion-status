// src/store.ts
import type { CheckResult } from "./checker.ts";
import { HISTORY_DAYS } from "./config.ts";

export interface DayStats {
  day: string;
  total: number;
  ok: number;
  uptimePercent: number;
}

/**
 * Record a single check result. Atomically increments daily counters.
 * KV key structure: ["checks", serviceId, "YYYY-MM-DD", "total" | "ok"]
 */
export async function recordCheck(
  kv: Deno.Kv,
  result: CheckResult,
  day: string,
): Promise<void> {
  const op = kv.atomic()
    .sum(["checks", result.serviceId, day, "total"], 1n);

  if (result.ok) {
    op.sum(["checks", result.serviceId, day, "ok"], 1n);
  }

  await op.commit();
}

/** Get aggregated stats for one service on one day */
export async function getDayStats(
  kv: Deno.Kv,
  serviceId: string,
  day: string,
): Promise<DayStats> {
  const [totalEntry, okEntry] = await Promise.all([
    kv.get<Deno.KvU64>(["checks", serviceId, day, "total"]),
    kv.get<Deno.KvU64>(["checks", serviceId, day, "ok"]),
  ]);

  const total = Number(totalEntry.value ?? 0n);
  const ok = Number(okEntry.value ?? 0n);

  return {
    day,
    total,
    ok,
    uptimePercent: total === 0 ? 0 : (ok / total) * 100,
  };
}

/** Get history for the last N days (default HISTORY_DAYS) */
export async function getServiceHistory(
  kv: Deno.Kv,
  serviceId: string,
  now: Date = new Date(),
  days: number = HISTORY_DAYS,
): Promise<DayStats[]> {
  const result: DayStats[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    result.push(await getDayStats(kv, serviceId, day));
  }

  return result;
}

/** Compute overall uptime percentage across all days with data */
export function computeOverallUptime(history: DayStats[]): number {
  const withData = history.filter((d) => d.total > 0);
  if (withData.length === 0) return 0;
  const totalChecks = withData.reduce((sum, d) => sum + d.total, 0);
  const totalOk = withData.reduce((sum, d) => sum + d.ok, 0);
  return (totalOk / totalChecks) * 100;
}

/** Count the number of nines in an uptime percentage */
export function countNines(uptimePercent: number): number {
  if (uptimePercent <= 0) return 0;
  if (uptimePercent >= 100) return Infinity;
  return -Math.log10(1 - uptimePercent / 100);
}

/** Get a fun flavor label for the nines count */
export function ninesLabel(nines: number): string {
  if (!isFinite(nines)) return "S";
  if (nines <= 0) return "";
  if (nines >= 5) return "carrier-grade";
  if (nines >= 4) return "enterprise-grade";
  if (nines >= 3) return "production-grade";
  if (nines >= 2) return "startup-grade";
  if (nines >= 1) return "hobby-grade";
  return "vibes-based";
}

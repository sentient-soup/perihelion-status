// src/scheduler.ts
import { CHECK_INTERVAL_MS, services } from "./config.ts";
import { checkService } from "./checker.ts";
import { recordCheck } from "./store.ts";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Run one round of checks for all services */
export async function runChecks(kv: Deno.Kv): Promise<void> {
  const day = todayString();
  const results = await Promise.allSettled(
    services.map((svc) => checkService(svc)),
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      await recordCheck(kv, result.value, day);
      const icon = result.value.ok ? "UP" : "DOWN";
      console.log(
        `[${icon}] ${result.value.serviceId} — ${result.value.latencyMs}ms`,
      );
    }
  }
}

/** Start the background check loop */
export function startScheduler(kv: Deno.Kv): void {
  console.log(
    `Scheduler started: checking ${services.length} services every ${
      CHECK_INTERVAL_MS / 1000
    }s`,
  );

  // Run immediately on start
  runChecks(kv);

  // Then repeat on interval
  setInterval(() => runChecks(kv), CHECK_INTERVAL_MS);
}

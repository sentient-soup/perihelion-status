// src/checker.ts
import type { ServiceConfig } from "./config.ts";

export interface CheckResult {
  serviceId: string;
  ok: boolean;
  statusCode: number | null;
  latencyMs: number;
  timestamp: number;
}

export async function checkService(
  service: ServiceConfig,
): Promise<CheckResult> {
  const start = performance.now();
  const expectedStatus = service.expectedStatus ?? 200;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const resp = await fetch(service.url, {
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    const latencyMs = Math.round(performance.now() - start);

    return {
      serviceId: service.id,
      ok: resp.status === expectedStatus,
      statusCode: resp.status,
      latencyMs,
      timestamp: Date.now(),
    };
  } catch {
    return {
      serviceId: service.id,
      ok: false,
      statusCode: null,
      latencyMs: Math.round(performance.now() - start),
      timestamp: Date.now(),
    };
  }
}

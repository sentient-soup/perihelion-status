export interface ServiceConfig {
  /** Unique slug used as KV key and URL fragment */
  id: string;
  /** Display name shown on the status page */
  name: string;
  /** Full URL to health-check (HTTP GET) */
  url: string;
  /** Expected HTTP status code (default 200) */
  expectedStatus?: number;
}

function loadServices(): ServiceConfig[] {
  const path = Deno.env.get("SERVICES_FILE");
  if (!path) {
    console.error(
      "SERVICES_FILE environment variable is not set.\n" +
        "Set it to the path of a JSON file defining your services.\n" +
        "See services.example.json for the expected format.",
    );
    Deno.exit(1);
  }

  try {
    const json = Deno.readTextFileSync(path);
    const parsed = JSON.parse(json) as ServiceConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error(`${path} must contain a non-empty array of services.`);
      Deno.exit(1);
    }
    console.log(`Loaded ${parsed.length} services from ${path}`);
    return parsed;
  } catch (e) {
    console.error(`Failed to load services from ${path}:`, e);
    Deno.exit(1);
  }
}

export const services: ServiceConfig[] = loadServices();

/** How often to check each service (ms) */
export const CHECK_INTERVAL_MS = Number(
  Deno.env.get("CHECK_INTERVAL_MS") ?? 60_000,
);

/** How many days of history to display */
export const HISTORY_DAYS = Number(Deno.env.get("HISTORY_DAYS") ?? 90);

/** Port the status page listens on */
export const PORT = Number(Deno.env.get("PORT") ?? 3000);

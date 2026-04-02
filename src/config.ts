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

export const services: ServiceConfig[] = [
  {
    id: "jellyfin",
    name: "Jellyfin",
    url: "http://perihelion:8096/health",
  },
  {
    id: "audiobookshelf",
    name: "Audiobookshelf",
    url: "http://perihelion:13378/healthcheck",
  },
  {
    id: "home-assistant",
    name: "Home Assistant",
    url: "http://perihelion:8123/api/",
  },
  {
    id: "nextcloud",
    name: "Nextcloud",
    url: "http://perihelion:8080/status.php",
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    url: "http://perihelion:8222/alive",
  },
];

/** How often to check each service (ms) */
export const CHECK_INTERVAL_MS = 60_000;

/** How many days of history to display */
export const HISTORY_DAYS = 90;

/** Port the status page listens on */
export const PORT = 3000;

// src/directory.ts
// User-facing copy for the /start and /directory pages. Lives in git (unlike
// services.json, which is host-local) because it is content, not config.
// ponytail: hardcoded list, move into services.json only if it starts changing per host.

export interface DirectoryEntry {
  /** Plain-language name shown to users */
  title: string;
  /** One short sentence on what it's for */
  blurb: string;
  /** Public address, no scheme */
  host: string;
  /** App store links. Empty = browser only. */
  apps: { label: string; href: string }[];
  /** Optional extra line under the blurb */
  note?: string;
  /** Matching id in services.json, for the live status line. Unmatched = no status shown. */
  statusId: string;
  /** Inline SVG icon (24x24 viewBox), colored via currentColor */
  icon: string;
  /** CSS color token for the icon tile */
  hue: string;
}

/** Help channel. Members-only server, so this opens it for people already added (no invite). */
export const discord = {
  url: "https://discord.com/channels/1562877850502176879",
  // ponytail: hotlinked; the hash changes if the server icon changes, so update it then.
  icon: "https://cdn.discordapp.com/icons/1562877850502176879/7c90737f8babe4a874fe7c2ee6e74ded.webp?size=128",
};

export const directory: DirectoryEntry[] = [
  {
    title: "Movies & TV",
    blurb: "Stream the full library on your phone, computer or TV.",
    host: "media.perihelion.live",
    apps: [
      { label: "iPhone & iPad", href: "https://apps.apple.com/us/app/jellyfin-mobile/id1480192618" },
      { label: "Android", href: "https://play.google.com/store/apps/details?id=org.jellyfin.mobile" },
    ],
    note: "On a TV? Most smart TVs have the Jellyfin app in their app store.",
    statusId: "jellyfin",
    icon: `<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>`,
    hue: "--hue-watch",
  },
  {
    title: "Audiobooks",
    blurb: "Listen anywhere. Your place is saved across devices.",
    host: "books.perihelion.live",
    apps: [
      // Official iOS app is TestFlight-only (beta), so Plappa (third-party, App Store) leads.
      { label: "iPhone (Plappa)", href: "https://apps.apple.com/us/app/plappa/id6475201956" },
      { label: "iPhone (official beta)", href: "https://testflight.apple.com/join/wiic7QIW" },
      { label: "Android", href: "https://play.google.com/store/apps/details?id=com.audiobookshelf.app" },
    ],
    statusId: "audiobookshelf",
    icon: `<path d="M4 15v-3a8 8 0 0 1 16 0v3" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="3" y="14" width="5" height="7" rx="2" fill="currentColor"/><rect x="16" y="14" width="5" height="7" rx="2" fill="currentColor"/>`,
    hue: "--hue-listen",
  },
  {
    title: "Requests",
    blurb: "Missing a movie or show? Request it. Most arrive within a day.",
    host: "request.perihelion.live",
    apps: [],
    statusId: "jellyseerr",
    icon: `<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    hue: "--hue-request",
  },
];

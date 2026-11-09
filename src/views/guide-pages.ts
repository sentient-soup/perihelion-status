// src/views/guide-pages.ts — the user-facing /start page
import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import { discord } from "../directory.ts";
import type { DirectoryEntry } from "../directory.ts";
import type { LiveStatus } from "../store.ts";
import { layout } from "./layout.ts";
import { masthead } from "./components.ts";

type H = HtmlEscapedString | Promise<HtmlEscapedString>;

export interface DirectoryItem {
  entry: DirectoryEntry;
  /** undefined = this service isn't monitored, so show no status line */
  live?: LiveStatus | null;
}

function liveLine(live: LiveStatus | null | undefined): H | string {
  if (live === undefined) return "";
  const [cls, word] = !live
    ? ["nodata", "Checking…"]
    : live.ok
    ? ["up", "Working"]
    : ["down", "Down right now"];
  return html`<span class="svc-live ${cls}"><span class="status ${cls}"></span>${word}</span>`;
}

function card({ entry, live }: DirectoryItem): H {
  return html`
    <article class="svc">
      <span class="svc-icon" style="color: var(${entry.hue})">
        <svg viewBox="0 0 24 24" aria-hidden="true">${raw(entry.icon)}</svg>
      </span>
      <div class="svc-body">
        <h3 class="svc-title"><a href="https://${entry.host}">${entry.title}</a></h3>
        <p class="svc-blurb">${entry.blurb}</p>
        <a class="svc-host" href="https://${entry.host}">${entry.host}</a>
        ${entry.note ? html`<p class="svc-note">${entry.note}</p>` : ""}
        <div class="svc-meta">
          ${entry.apps.length
            ? entry.apps.map((a) => html`<a href="${a.href}">${a.label}</a>`)
            : html`<span>Web only</span>`}
          ${liveLine(live)}
        </div>
      </div>
    </article>
  `;
}

function discordBox(): H {
  return html`
    <a class="stuck" href="${discord.url}">
      <img src="${discord.icon}" alt="" width="56" height="56" />
      <span>
        <b>Get help on Discord</b>
        <span>You've already been added to the Perihelion server. Post what you
        were doing and a screenshot.</span>
      </span>
    </a>
  `;
}

export function startPage(items: DirectoryItem[]): H {
  return layout(
    "Onboarding Guide · Perihelion",
    html`
      <div class="sheet">
        ${masthead("Onboarding Guide", "Getting started with Perihelion", "start")}
        <main class="guide">
          <p class="intro">
            A private streaming service for movies, TV and audiobooks.
            Free, with no ads.
          </p>

          <section>
            <h2>Services</h2>
            <div class="svc-list">${items.map(card)}</div>
          </section>

          <section>
            <h2>Setup</h2>
            <ol class="steps">
              <li><div><h3>Accept your invite</h3>
                <p>Open the invite email and choose a password. One login works
                for every service.</p></div></li>
              <li><div><h3>Install the apps</h3>
                <p>Use the links above, or your TV's app store. A web browser
                also works.</p></div></li>
              <li><div><h3>Sign in</h3>
                <p>Enter the address shown above as the server, then sign in
                with your Perihelion login.</p></div></li>
            </ol>
          </section>

          <section id="help">
            <h2>Help</h2>
            <details open><summary>A page won't load</summary><ul>
              <li>Check your internet connection and the address.</li>
              <li>Check <a href="/">service status</a>. If the service shows
              as down, it's already known.</li>
            </ul></details>
            <details><summary>Forgot password</summary><ul>
              <li>Use <b>Forgot password</b> on the sign-in page.</li>
            </ul></details>
            <details><summary>Video keeps stopping</summary><ul>
              <li>Lower the quality in the player settings, or try another device.</li>
            </ul></details>
            <details><summary>Can't find a title</summary><ul>
              <li>Request it at <a href="https://request.perihelion.live">request.perihelion.live</a>.</li>
            </ul></details>
            ${discordBox()}
          </section>
        </main>
      </div>
    `,
  );
}

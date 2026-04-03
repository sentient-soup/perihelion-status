// src/views/layout.ts
import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

export function layout(
  title: string,
  body: HtmlEscapedString | Promise<HtmlEscapedString>,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/static/style.css" />
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
}

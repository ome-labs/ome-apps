// Serves the built renderer from `app://ome/` instead of file://, so pages get a real origin, a Content Security
// Policy header and no access to the rest of the disk.
import { join, normalize, relative } from "node:path";
import { pathToFileURL } from "node:url";

import { net, protocol } from "electron";

const SCHEME = "app";

/** No inline script, no remote anything: the renderer talks to the world only through the preload's bridge. */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

/** Must run before the app is ready. */
export function registerScheme(): void {
  protocol.registerSchemesAsPrivileged([
    { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } },
  ]);
}

/** Serves `root` (the built renderer); unknown paths fall back to `index.html` for client-side routes. */
export function serveRenderer(root: string): void {
  protocol.handle(SCHEME, async (request) => {
    const path = decodeURIComponent(new URL(request.url).pathname);
    const file = normalize(join(root, path));
    // A path that escapes the renderer's folder is refused, whatever `..` tricks it uses.
    if (relative(root, file).startsWith("..")) return new Response("Not found", { status: 404 });

    let response = await net.fetch(pathToFileURL(file).href).catch(() => null);
    if (!response?.ok) response = await net.fetch(pathToFileURL(join(root, "index.html")).href);

    const headers = new Headers(response.headers);
    headers.set("Content-Security-Policy", CSP);
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(response.body, { status: response.status, headers });
  });
}

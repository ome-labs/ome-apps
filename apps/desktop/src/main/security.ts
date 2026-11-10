// The app shows only its own pages. Every web contents runs sandboxed and isolated; nothing navigates away, opens
// windows, embeds webviews or gets a permission beyond writing to the clipboard. Links to https pages open in the
// member's browser.
import { app, session, shell } from "electron";

/** Where the app's own pages come from: the `app://` protocol, or the dev server while developing. */
export function isAppUrl(url: string): boolean {
  if (url.startsWith("app://ome/")) return true;
  const dev = process.env["ELECTRON_RENDERER_URL"];
  return !app.isPackaged && dev !== undefined && url.startsWith(dev);
}

export function enforceSecurity(): void {
  app.enableSandbox();

  app.on("web-contents-created", (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("https://")) void shell.openExternal(url);
      return { action: "deny" };
    });
    contents.on("will-navigate", (event, url) => {
      if (!isAppUrl(url)) event.preventDefault();
    });
    contents.on("will-attach-webview", (event) => event.preventDefault());
  });
}

/** The one permission the app's own pages get: writing to the clipboard, for copy buttons. Reading it never. */
const ALLOWED = new Set(["clipboard-sanitized-write"]);

/** Camera, microphone, notifications, geolocation…: refused, as is anything from a page that isn't the app's. Needs the
 * app to be ready. */
export function denyPermissions(): void {
  session.defaultSession.setPermissionRequestHandler((contents, permission, callback) => {
    callback(ALLOWED.has(permission) && isAppUrl(contents.getURL()));
  });
  session.defaultSession.setPermissionCheckHandler(
    (_contents, permission, requestingOrigin) =>
      ALLOWED.has(permission) && isAppUrl(`${requestingOrigin}/`),
  );
}

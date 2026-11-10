// The app shows only its own pages. Every web contents runs sandboxed and isolated; nothing navigates away, opens
// windows, embeds webviews or gets a permission. Links to https pages open in the member's browser.
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

/** Camera, microphone, notifications, geolocation…: the app asks for none, so every request is refused. Needs the
 * app to be ready. */
export function denyPermissions(): void {
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => {
    callback(false);
  });
  session.defaultSession.setPermissionCheckHandler(() => false);
}

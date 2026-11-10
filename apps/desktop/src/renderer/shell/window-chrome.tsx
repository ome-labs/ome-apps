// The app's own title bar pieces. macOS keeps its traffic lights (inset by the main process); Linux and Windows run
// frameless, so the app draws minimise, maximise and close the same way everywhere.
import { cn } from "@ome-labs/ui-web";

export const IS_MAC = window.ome.window.platform === "darwin";

const minimize = (): void => window.ome.window.minimize();
const toggleMaximize = (): void => window.ome.window.toggleMaximize();
const close = (): void => window.ome.window.close();

const control =
  "focus-ring grid h-8 w-10 place-items-center rounded-md text-fg-muted transition-[background-color,color] duration-fast ease-standard hover:bg-hover hover:text-fg";

/** Minimise, maximise and close, on platforms without native ones in the window. */
export function WindowControls() {
  if (IS_MAC) return null;
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" aria-label="Minimise" className={control} onClick={minimize}>
        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden>
          <path d="M1 5h8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <button type="button" aria-label="Maximise" className={control} onClick={toggleMaximize}>
        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden>
          <rect
            x="1.1"
            y="1.1"
            width="7.8"
            height="7.8"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Close"
        className={cn(control, "hover:bg-danger-solid hover:text-on-accent")}
        onClick={close}
      >
        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden>
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}

/**
 * The title bar over screens without the app's top bar (the first run, full-window states): an empty strip that moves
 * the window, with the controls on the right where the platform has none.
 */
export function TitleStrip() {
  return (
    <div
      className="app-drag absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-end px-2"
      onDoubleClick={IS_MAC ? undefined : toggleMaximize}
    >
      <WindowControls />
    </div>
  );
}

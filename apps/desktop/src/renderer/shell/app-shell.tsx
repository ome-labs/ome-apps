import { Outlet } from "@tanstack/react-router";

import { Sidebar } from "./sidebar.tsx";
import { TopBar } from "./top-bar.tsx";

/** Top bar, sidebar and the page: the layout of the UI guide's §5.4, until ui-web's shell replaces it. */
export function AppShell() {
  return (
    <div className="grid h-full grid-cols-[240px_1fr] grid-rows-[52px_1fr]">
      <div className="col-span-2">
        <TopBar />
      </div>
      <Sidebar />
      <main className="overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

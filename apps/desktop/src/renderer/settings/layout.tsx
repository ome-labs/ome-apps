import { Link, Outlet, useLocation } from "@tanstack/react-router";

import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

import { SETTINGS_PAGES, type SettingsPageEntry } from "./pages.tsx";
import { RestartProvider } from "./restart.tsx";

/** `/settings/*`: the list of settings pages on the left, the open one beside it. */
export function SettingsLayout() {
  const { pathname } = useLocation();

  return (
    <div className="grid grid-cols-[200px_minmax(0,1fr)] gap-10">
      <nav aria-label="Settings" className="sticky top-0 flex h-fit flex-col gap-0.5 self-start">
        <span className="px-2.5 pb-3 type-heading-s text-fg">Settings</span>
        {SETTINGS_PAGES.map((page) => (
          <SettingsLink
            key={page.path}
            page={page}
            active={pathname === `/settings/${page.path}`}
          />
        ))}
      </nav>
      <div className="flex max-w-[720px] min-w-0 flex-col gap-6">
        <RestartProvider>
          <Outlet />
        </RestartProvider>
      </div>
    </div>
  );
}

function SettingsLink({ page, active }: { page: SettingsPageEntry; active: boolean }) {
  return (
    <Link
      to={`/settings/${page.path}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring flex h-control-md items-center gap-2.5 rounded-md px-2.5 type-label-m transition-[background-color,color] duration-fast ease-standard",
        active ? "bg-accent-subtle text-accent-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
      )}
    >
      <Icon name={page.icon} size={16} className={active ? "text-accent-fg" : "text-fg-subtle"} />
      {page.label}
    </Link>
  );
}

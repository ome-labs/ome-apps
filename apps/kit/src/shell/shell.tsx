import { useCallback, useEffect, useState } from "react";

import { Link, Outlet, useRouterState } from "@tanstack/react-router";

import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import {
  IconButton,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  Toaster,
  cn,
  useTheme,
} from "@ome-labs/ui-web";

import { nav, navItems } from "../nav.ts";
import { SplitContext } from "../theme/theme-frame.tsx";
import { Search } from "./search.tsx";
import { ThemeSwitch, type ThemeView } from "./theme-switch.tsx";

/** The kit's frame: the page list at the left, a header with the breadcrumb and theme, and search on ⌘K. */
export function Shell() {
  const { preference, resolved, setPreference } = useTheme();
  const [split, setSplit] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const view: ThemeView = split ? "split" : preference;
  const onView = useCallback(
    (next: ThemeView) => {
      setSplit(next === "split");
      // Split draws both themes itself; the chrome around it stays light so neither half looks like the page.
      setPreference(next === "split" ? "light" : next);
    },
    [setPreference],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = navItems.find((item) => item.to === pathname);

  return (
    <div className="flex min-h-dvh bg-canvas text-fg">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-brand-night/40 tablet:hidden"
        />
      ) : null}
      <Sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-40 h-dvh overflow-y-auto transition-transform duration-base ease-emphasized",
          "tablet:sticky tablet:top-0 tablet:translate-x-0",
          menuOpen ? "translate-x-0 shadow-4" : "-translate-x-full max-tablet:invisible",
        )}
        header={
          <div className="flex flex-col gap-3 pb-1">
            <Link to="/" className="focus-ring flex items-center gap-2 rounded-sm px-1.5 py-1">
              <Logo
                variant="lockup-horizontal"
                tone={resolved === "dark" ? "dark" : "light"}
                height={22}
                title="Ome"
              />
              <span className="mt-0.5 type-label-s text-fg-subtle">Kit</span>
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={cn(
                "focus-ring flex h-control-md cursor-pointer items-center gap-2 rounded-md bg-surface px-2.5 type-body-s text-fg-subtle shadow-field",
                "border border-line transition-colors duration-fast hover:border-line-strong hover:text-fg-muted",
              )}
            >
              <Icon name="search" size={16} />
              <span className="flex-1 text-left">Search</span>
              <kbd className="rounded-xs border border-line-subtle bg-sunken px-1.5 type-mono-s text-fg-subtle">
                ⌘K
              </kbd>
            </button>
          </div>
        }
      >
        {nav.map((section) => (
          <SidebarGroup key={section.label} title={section.label}>
            {section.items.map((item) => (
              <SidebarItem
                key={item.to}
                icon={item.icon}
                label={item.title}
                active={pathname === item.to}
                render={<Link to={item.to} />}
                // On a phone the menu covers the page; choosing a page is the end of using it.
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </SidebarGroup>
        ))}
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[52px] shrink-0 items-center gap-2 border-b border-line-subtle bg-canvas/85 px-4 backdrop-blur-md tablet:px-6">
          <IconButton
            icon="menu"
            label="Open menu"
            className="tablet:hidden"
            onClick={() => setMenuOpen(true)}
          />
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 type-label-m">
            {current ? (
              <>
                <span className="text-fg-subtle max-tablet:hidden">{current.group}</span>
                <span aria-hidden className="text-fg-disabled max-tablet:hidden">
                  /
                </span>
                <span className="truncate text-fg">{current.title}</span>
              </>
            ) : (
              <span className="text-fg">Ome Kit</span>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <IconButton
              icon="search"
              label="Search"
              className="tablet:hidden"
              onClick={() => setSearchOpen(true)}
            />
            <ThemeSwitch view={view} onView={onView} />
          </div>
        </header>
        <main className="min-w-0 flex-1">
          <SplitContext value={split}>
            <Outlet />
          </SplitContext>
        </main>
      </div>

      <Search open={searchOpen} onOpenChange={setSearchOpen} />
      <Toaster />
    </div>
  );
}

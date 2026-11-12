import { useEffect, useRef, useState } from "react";

import { Link } from "@tanstack/react-router";

import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

import { navItems } from "./nav-items.ts";

/**
 * The header. At the top of a page it lies flat across the sky; once the page scrolls it gathers into a glass pill
 * (motion/base). On a phone the links move into a full-screen menu, a modal <dialog> so focus stays inside it.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-2.5 md:pt-4">
      <nav
        aria-label="Main"
        className={cn(
          "flex h-[52px] w-full items-center justify-between rounded-full pr-2 pl-4 transition-[max-width,background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-standard md:h-14",
          scrolled
            ? "glass max-w-[820px] md:pl-5"
            : "max-w-[1440px] border border-transparent md:px-9 md:pr-9",
        )}
      >
        <Link to="/" aria-label="Ome, home" className="flex items-center rounded-full">
          <Logo
            variant="lockup-horizontal"
            tone="dark"
            title=""
            className={cn("w-auto transition-[height]", scrolled ? "h-6" : "h-6 md:h-7")}
          />
        </Link>

        <ul className={cn("hidden items-center md:flex", scrolled ? "gap-6" : "gap-8")}>
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="rounded-full px-1 py-1 text-sm font-medium text-white/90 transition-colors hover:text-white data-[status=active]:text-white data-[status=active]:underline data-[status=active]:decoration-amber data-[status=active]:decoration-2 data-[status=active]:underline-offset-8"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link
            to="/install"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-brand-night shadow-[0_6px_18px_rgb(5_8_20/0.2)] transition-colors hover:bg-[#e3eafb] md:px-4 md:py-2.5 md:text-sm"
          >
            Install
            <Icon name="arrow-right" size={16} className="hidden md:block" />
          </Link>
          <button
            type="button"
            aria-label="Open the menu"
            aria-haspopup="dialog"
            onClick={() => menuRef.current?.showModal()}
            className="glass-soft grid size-9 place-items-center rounded-full text-white md:hidden"
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </nav>

      <dialog
        ref={menuRef}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[rgb(7_10_24/0.94)] p-0 text-white backdrop:bg-transparent open:flex open:flex-col"
      >
        <div className="flex h-[72px] items-center justify-between px-4">
          <Logo variant="lockup-horizontal" tone="dark" title="Ome" className="h-6 w-auto" />
          <form method="dialog">
            <button
              type="submit"
              aria-label="Close the menu"
              className="glass-soft grid size-10 place-items-center rounded-full"
            >
              <Icon name="x" size={20} />
            </button>
          </form>
        </div>
        <ul className="mt-6 flex flex-col px-4">
          {[
            { to: "/" as const, label: "Home" },
            ...navItems,
            { to: "/install" as const, label: "Install" },
          ].map((item) => (
            <li key={item.to} className="border-b border-white/10">
              <Link
                to={item.to}
                onClick={() => menuRef.current?.close()}
                className="flex items-center justify-between rounded-none py-3 font-display text-[34px] leading-tight"
              >
                {item.label}
                <Icon name="arrow-up-right" size={20} className="text-white/50" />
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </header>
  );
}

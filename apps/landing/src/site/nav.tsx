import { useEffect, useRef, useState } from "react";

import { Link } from "@tanstack/react-router";

import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

import { socials } from "../actions/social-links.tsx";
import type { PagePath } from "../seo/pages.ts";

/** The header's pages, in order; Home is the logo, and the button is the code on GitHub. */
const navItems: readonly { to: PagePath; label: string }[] = [
  { to: "/product", label: "Product" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/security", label: "Security" },
  { to: "/about", label: "About" },
];

/** How far the page scrolls before the header gathers, and how far back up before it spreads out again. */
const gatherAt = 140;
const spreadAt = 60;

/**
 * The header. At the top of a page it lies flat across the sky; once the reader has properly scrolled it gathers
 * into a glass pill. The gap between the two thresholds keeps it from flickering around one scroll position. On a
 * phone the links move into a full-screen menu, a modal <dialog> so focus stays inside it.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const update = () =>
      setScrolled((was) => (was ? window.scrollY > spreadAt : window.scrollY > gatherAt));
    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-2.5 md:pt-4">
      <nav
        aria-label="Main"
        className={cn(
          "flex h-[52px] w-full items-center justify-between rounded-full pr-2 pl-4 transition-[max-width,padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-emphasized md:h-14",
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
            className={cn(
              "w-auto transition-[height] duration-500 ease-emphasized",
              scrolled ? "h-6" : "h-6 md:h-7",
            )}
          />
        </Link>

        <ul
          className={cn(
            "hidden items-center transition-[gap] duration-500 ease-emphasized md:flex",
            scrolled ? "gap-6" : "gap-8",
          )}
        >
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
          <a
            href={socials[0].href}
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-brand-night shadow-[0_6px_18px_rgb(5_8_20/0.2)] transition-colors hover:bg-[#e3eafb] md:px-4 md:py-2.5 md:text-sm"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
              <path d={socials[0].path} />
            </svg>
            GitHub
          </a>
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
          {[{ to: "/" as const, label: "Home" }, ...navItems].map((item) => (
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

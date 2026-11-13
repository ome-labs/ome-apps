import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { Logo } from "@ome-labs/brand/web";

import type { PagePath } from "../seo/pages.ts";
import { links } from "./links.ts";

const product: { to: PagePath; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/product", label: "Product" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/security", label: "Security" },
  { to: "/install", label: "Install" },
];

const elsewhere = [
  { href: links.github, label: "GitHub" },
  { href: links.x, label: `X · ${links.xHandle}` },
  { href: links.aztecForum, label: "Aztec forum" },
];

// Prerendered at build time, so the year is the build's.
const year = new Date().getFullYear();

const linkClass = "rounded-sm text-sm text-white/75 transition-colors hover:text-white";

/** The ground under the day: the lake at night, where the page ends. */
export function Footer() {
  return (
    <footer className="relative bg-ink px-5 pt-12 pb-10 md:px-[max(2rem,calc((100vw-1200px)/2))] md:pt-20 md:pb-12">
      <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
        <div className="flex flex-col gap-3.5">
          <Logo
            variant="lockup-horizontal"
            tone="dark"
            title="Ome"
            className="h-8 w-auto self-start md:h-9"
          />
          <p className="text-[15px] text-white/70">The private multisig for Aztec.</p>
          <p className="font-mono text-xs text-white/55">ōme · oh·meh · “two” in Nahuatl</p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:gap-x-10">
          <FooterColumn title="Product">
            {product.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title="Ome">
            <li>
              <Link to="/about" className={linkClass}>
                About the lake
              </Link>
            </li>
            <li>
              <a href={links.advisories} className={linkClass} rel="noreferrer">
                Report a vulnerability
              </a>
            </li>
            <li>
              <Link to="/privacy" className={linkClass}>
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className={linkClass}>
                Terms
              </Link>
            </li>
          </FooterColumn>
          <FooterColumn title="Elsewhere">
            {elsewhere.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClass} rel="noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 font-mono text-xs text-white/60 md:mt-16 md:flex-row md:justify-between">
        <p>Coming to Aztec soon.</p>
        <p>© {year} Ome Labs</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-[140px] flex-col gap-3">
      <h2 className="font-mono text-[11px] font-medium tracking-[0.08em] text-haze-soft uppercase">
        {title}
      </h2>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

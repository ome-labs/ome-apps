import { useEffect } from "react";

import { startAnalytics, track } from "./client.ts";
import type { OutboundTarget } from "./events.ts";

/**
 * The site-wide events, from the root layout: a page view on every route change, each section as it reaches the
 * middle of the screen, and every link click, read from one listener rather than wired into each link.
 */
export function useAnalytics(pathname: string): void {
  useEffect(() => {
    startAnalytics();
    document.addEventListener("click", onClick, { capture: true });

    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    track("$pageview", { $pathname: pathname });

    return watchSections();
  }, [pathname]);
}

/** Sections are `[data-section]` (set by layout/section.tsx); each is counted once per page view. */
function watchSections(): () => void {
  const seen = new Set<string>();
  // A line across the middle of the screen: a section counts when it crosses it, however tall it is.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const section = (entry.target as HTMLElement).dataset.section;
        if (!entry.isIntersecting || !section || seen.has(section)) continue;

        seen.add(section);
        observer.unobserve(entry.target);
        track("section_viewed", { section });
      }
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );

  for (const element of document.querySelectorAll("[data-section]")) observer.observe(element);

  return () => observer.disconnect();
}

function onClick(event: MouseEvent): void {
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return;

  const url = new URL(link.href, window.location.href);
  const placement = placementOf(link);

  if (url.origin !== window.location.origin) {
    track("outbound_clicked", { target: outboundTarget(url), placement, url: url.href });
    return;
  }

  // Only the site's buttons (PillLink marks them); plain navigation is already a page view.
  if (link.dataset.cta !== undefined) {
    track("cta_clicked", {
      label: link.textContent?.trim() ?? "",
      placement,
      destination: `${url.pathname}${url.hash}`,
    });
  }
}

function placementOf(element: Element): string {
  if (element.closest("header")) return "nav";
  if (element.closest("footer")) return "footer";

  return element.closest<HTMLElement>("[data-section]")?.dataset.section ?? "page";
}

function outboundTarget(url: URL): OutboundTarget {
  if (url.hostname === "github.com") {
    return url.pathname.includes("/security/advisories") ? "advisories" : "github";
  }
  if (url.hostname === "x.com" || url.hostname === "twitter.com") return "x";
  if (url.hostname === "forum.aztec.network") return "aztec_forum";

  return "other";
}

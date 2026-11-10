import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@ome-labs/icons/web";
import { PageHeader, cn } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";
import { RestartProvider } from "./restart.tsx";
import { About } from "./sections/about.tsx";
import { Advanced } from "./sections/advanced.tsx";
import { Appearance } from "./sections/appearance.tsx";
import { Network } from "./sections/network.tsx";
import { Profile } from "./sections/profile.tsx";
import { Proving } from "./sections/proving.tsx";
import { Relays } from "./sections/relays.tsx";
import { Signer } from "./sections/signer.tsx";

const SECTIONS = [
  { id: "appearance", label: "Appearance" },
  { id: "profile", label: "Profile" },
  { id: "signer", label: "Signer" },
  { id: "network", label: "Network & node" },
  { id: "relays", label: "Relays" },
  { id: "proving", label: "Proving" },
  { id: "advanced", label: "Advanced" },
  { id: "about", label: "About" },
] as const;

/** The scrolling pane a settings section sits in: the app's page panel. */
function paneOf(element: Element | null): HTMLElement | null {
  return element?.closest("main") ?? null;
}

/**
 * The section in view: the last one whose heading has reached the top of the pane, or the last section once the pane
 * is scrolled to its end. A section picked from the list stays picked until that scroll settles, even when it sits too
 * low to reach the top. Waits for the page to render.
 */
function useActiveSection(rendered: boolean): [string, (id: string) => void] {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const picked = useRef<string | null>(null);

  useEffect(() => {
    const pane = rendered ? paneOf(document.getElementById(SECTIONS[0].id)) : null;
    if (!pane) return;
    const update = (): void => {
      if (picked.current) return;
      const top = pane.getBoundingClientRect().top + 96;
      const atEnd = pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 4;
      let current: string = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= top) current = id;
      }
      setActive(atEnd ? (SECTIONS.at(-1)?.id ?? current) : current);
    };
    const settle = (): void => {
      picked.current = null;
    };
    // The member scrolling by hand ends a pick, even one that needed no scrolling (and so never settles).
    const takeOver = (): void => {
      picked.current = null;
      update();
    };
    update();
    pane.addEventListener("scroll", update, { passive: true });
    pane.addEventListener("scrollend", settle);
    pane.addEventListener("wheel", takeOver, { passive: true });
    pane.addEventListener("keydown", takeOver);
    return () => {
      pane.removeEventListener("scroll", update);
      pane.removeEventListener("scrollend", settle);
      pane.removeEventListener("wheel", takeOver);
      pane.removeEventListener("keydown", takeOver);
    };
  }, [rendered]);

  const pick = useCallback((id: string) => {
    picked.current = id;
    setActive(id);
  }, []);
  return [active, pick];
}

/** Scrolls the page panel (and only it) to a section. */
function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  const pane = paneOf(element);
  if (!element || !pane) return;
  const offset = element.getBoundingClientRect().top - pane.getBoundingClientRect().top;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  pane.scrollTo({ top: pane.scrollTop + offset - 24, behavior: reduced ? "auto" : "smooth" });
}

/** `/settings`: this member's own setup, the same in every vault. A vault's own settings live under the vault. */
export function SettingsPage() {
  const status = useOme("status", {});
  const config = useOme("config.get", {});
  const info = useOme("daemon.info", {});
  const [active, pick] = useActiveSection(Boolean(status.data?.profile && config.data));
  const [advanced, setAdvanced] = useState(false);

  const jump = useCallback(
    (id: string) => {
      if (id === "advanced") setAdvanced(true);
      pick(id);
      requestAnimationFrame(() => scrollToSection(id));
    },
    [pick],
  );
  const toggleAdvanced = useCallback(() => setAdvanced((open) => !open), []);

  if (!status.data?.profile || !config.data) return null;
  const { profile, node, signer, keeper } = status.data;
  const settings = config.data;

  return (
    <RestartProvider>
      <PageHeader
        title="Settings"
        description="Your profile and this computer's setup. Each vault has its own settings too."
      />
      <div className="grid grid-cols-[176px_minmax(0,1fr)] gap-10">
        <nav aria-label="Settings" className="sticky top-0 flex h-fit flex-col gap-0.5 self-start">
          {SECTIONS.map((section) => (
            <SectionLink
              key={section.id}
              id={section.id}
              label={section.label}
              active={active === section.id}
              onJump={jump}
            />
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-10">
          <Appearance />
          <Profile profile={profile} info={info.data} />
          <Signer signer={signer} settings={settings} />
          <Network node={node} />
          <Relays relays={settings.relays} />
          <Proving enabled={settings.proverEnabled} local={node.l1ChainId === 31_337} />
          <section id="advanced" className="scroll-mt-6">
            <button
              type="button"
              aria-expanded={advanced}
              onClick={toggleAdvanced}
              className="focus-ring flex w-full items-center justify-between rounded-lg px-1 py-2 text-left"
            >
              <span className="flex flex-col gap-1">
                <span className="type-heading-s text-fg">Advanced</span>
                <span className="type-body-s text-fg-muted">
                  A keeper on your own server, fees, and aztec-wallet.
                </span>
              </span>
              <Icon
                name="chevron-down"
                size={16}
                className={cn(
                  "text-fg-subtle transition-[rotate] duration-base ease-standard",
                  advanced && "rotate-180",
                )}
              />
            </button>
          </section>
          {advanced ? <Advanced keeper={keeper} settings={settings} /> : null}
          <About info={info.data} keeper={keeper} />
        </div>
      </div>
    </RestartProvider>
  );
}

function SectionLink({
  id,
  label,
  active,
  onJump,
}: {
  id: string;
  label: string;
  active: boolean;
  onJump: (id: string) => void;
}) {
  const click = useCallback(() => onJump(id), [id, onJump]);
  return (
    <button
      type="button"
      onClick={click}
      aria-current={active ? "true" : undefined}
      className={cn(
        "focus-ring rounded-md px-2.5 py-1.5 text-left type-label-m transition-[background-color,color] duration-fast ease-standard",
        active ? "bg-accent-subtle text-accent-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
      )}
    >
      {label}
    </button>
  );
}

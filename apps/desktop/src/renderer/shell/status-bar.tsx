import { useMemo } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { Status } from "@ome-labs/api";
import { Avatar, Menu, TopBar } from "@ome-labs/ui-web";

import { useProfileAvatar } from "../avatars/avatars.ts";
import { callOme } from "../data/ome.ts";
import { ThemeSwitch } from "./theme-switch.tsx";
import { IS_MAC, WindowControls } from "./window-chrome.tsx";

const lock = (): void => void callOme("signer.lock", {});

/**
 * The top bar, which is also the window's title bar: the logo, the theme and the profile menu. The node, keeper and
 * signer stay out of it; banners say when one of them needs attention. Its empty parts move the window.
 */
export function StatusBar({ status, onUnlock }: { status: Status; onUnlock: () => void }) {
  const navigate = useNavigate();
  const { profile, signer } = status;
  const picture = useProfileAvatar(profile?.name);

  const menu = useMemo(
    () => [
      {
        label: "Settings",
        icon: "settings" as const,
        shortcut: "⌘,",
        onSelect: (): void => void navigate({ to: "/settings" }),
      },
      signer.locked
        ? { label: "Unlock…", icon: "unlock" as const, onSelect: onUnlock }
        : { label: "Lock now", icon: "lock" as const, shortcut: "⌘L", onSelect: lock },
    ],
    [navigate, onUnlock, signer.locked],
  );

  return (
    <div className="app-drag flex shrink-0 items-center bg-surface pr-2">
      <TopBar
        className="min-w-0 flex-1"
        windowControlsInset={IS_MAC}
        profile={
          <div className="flex items-center gap-1">
            <ThemeSwitch />
            {profile ? (
              <Menu
                align="end"
                items={menu}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-1.5 py-1 type-label-m text-fg"
                  >
                    <Avatar name={profile.name} source={picture} size={22} />
                    {profile.name}
                  </button>
                }
              />
            ) : null}
          </div>
        }
      />
      <WindowControls />
    </div>
  );
}

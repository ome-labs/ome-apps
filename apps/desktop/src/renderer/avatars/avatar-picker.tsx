import { useCallback, useMemo, useState } from "react";

import type { AvatarId } from "@ome-labs/brand/web";
import { Avatar, Banner, Button, Dialog, cn } from "@ome-labs/ui-web";

import type { AvatarTarget } from "../../bridge/contract.ts";
import { unwrap } from "../data/session.ts";
import { PROFILE_ART, VAULT_ART, useAvatarsChanged } from "./avatars.ts";

/**
 * Choosing a picture: one of the kit's avatars, or (where `target` is set) an image file. Without a target, the
 * choice is handed back through `onPick` for the caller to keep until there's something to give it to (a profile
 * being set up, a vault not yet founded).
 */
export function AvatarPicker({
  kind,
  name,
  open,
  onOpenChange,
  selected,
  target,
  onPick,
  removable,
}: {
  kind: "profile" | "vault";
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: AvatarId | undefined;
  target?: AvatarTarget | undefined;
  onPick?: ((id: AvatarId) => void) | undefined;
  removable?: boolean | undefined;
}) {
  const changed = useAvatarsChanged();
  const [pending, setPending] = useState<string>();
  const [error, setError] = useState<string>();
  const art = kind === "profile" ? PROFILE_ART : VAULT_ART;
  const shape = kind === "profile" ? "circle" : "square";

  const run = useCallback(
    async (label: string, action: () => Promise<boolean>) => {
      setPending(label);
      setError(undefined);
      try {
        if (await action()) onOpenChange(false);
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
      } finally {
        setPending(undefined);
      }
    },
    [onOpenChange],
  );

  const choose = useCallback(
    (id: AvatarId) =>
      void run(id, async () => {
        if (target) changed(await unwrap(window.ome.avatars.setArt(target, id)));
        onPick?.(id);
        return true;
      }),
    [changed, onPick, run, target],
  );
  const file = useCallback(
    () =>
      void run("file", async () => {
        if (!target) return false;
        const next = await unwrap(window.ome.avatars.chooseFile(target));
        if (!next) return false;
        changed(next);
        return true;
      }),
    [changed, run, target],
  );
  const remove = useCallback(
    () =>
      void run("remove", async () => {
        if (target) changed(await unwrap(window.ome.avatars.clear(target)));
        return true;
      }),
    [changed, run, target],
  );

  return (
    <Dialog
      title={kind === "profile" ? "Your picture" : "Vault picture"}
      description="Only on this computer; other members don't see it."
      open={open}
      onOpenChange={onOpenChange}
      wide
    >
      <div className="flex flex-col gap-5">
        {error ? <Banner kind="alarm">{error}</Banner> : null}
        <div className="grid grid-cols-6 gap-3" aria-label="Pictures">
          {art.map((item) => (
            <ArtChoice
              key={item.id}
              id={item.id}
              title={item.title}
              name={name}
              shape={shape}
              selected={item.id === selected}
              disabled={pending !== undefined}
              onChoose={choose}
            />
          ))}
        </div>
        {target ? (
          <div className="flex items-center justify-between gap-2 border-t border-line-subtle pt-4">
            <Button
              icon="upload"
              onClick={file}
              pending={pending === "file"}
              disabled={pending !== undefined && pending !== "file"}
            >
              Choose a file…
            </Button>
            {removable ? (
              <Button
                variant="ghost"
                onClick={remove}
                pending={pending === "remove"}
                disabled={pending !== undefined}
              >
                Use the default
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}

function ArtChoice({
  id,
  title,
  name,
  shape,
  selected,
  disabled,
  onChoose,
}: {
  id: AvatarId;
  title: string;
  name: string;
  shape: "circle" | "square";
  selected: boolean;
  disabled: boolean;
  onChoose: (id: AvatarId) => void;
}) {
  const click = useCallback(() => onChoose(id), [id, onChoose]);
  const source = useMemo(() => ({ kind: "art" as const, id }), [id]);
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={click}
      className={cn(
        "focus-ring grid place-items-center rounded-lg p-1.5 transition-[background-color,box-shadow] duration-fast ease-standard hover:bg-hover",
        shape === "circle" && "rounded-full",
        selected && "bg-accent-subtle shadow-[inset_0_0_0_2px_var(--color-accent)]",
      )}
    >
      <Avatar name={name} source={source} shape={shape} size={64} />
    </button>
  );
}

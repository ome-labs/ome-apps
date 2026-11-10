import { useMemo, useRef, useState, type RefObject } from "react";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Icon, type IconName } from "@ome-labs/icons/web";

import { Kbd, KbdCombo } from "../navigation/kbd.tsx";
import { cn } from "../styling/class-names.ts";

export type CommandItem = {
  id: string;
  label: string;
  /** A short muted note after the label, such as the vault a page belongs to. Searched too. */
  hint?: string | undefined;
  icon?: IconName | undefined;
  /** Other words that should find it ("send" for Transfer). Searched, never shown. */
  keywords?: string[] | undefined;
  /** The item's own shortcut, shown on the right; the menu doesn't bind it. */
  shortcut?: string[] | undefined;
  onSelect: () => void;
};

export type CommandGroup = { title: string; items: CommandItem[] };

export type CommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string | undefined;
  emptyText?: string | undefined;
};

const moveKeys = ["↑", "↓"];

/** Every word of the query must appear in the label, the hint or a keyword, in any case. */
function matches(item: CommandItem, words: string[]) {
  const haystack = [item.label, item.hint ?? "", ...(item.keywords ?? [])].join(" ").toLowerCase();

  return words.every((word) => haystack.includes(word));
}

/**
 * A ⌘K command menu: type to filter, arrows to move, Enter to run. Base UI's autocomplete supplies the
 * combobox and listbox semantics, the active descendant and scrolling the active item into view; this decides
 * what matches and how it looks. Opening it is the app's job, since the app owns its shortcuts.
 *
 * It opens and closes without a transition: it is reached for from the keyboard many times a day, and any
 * animation there reads as lag between the keypress and the menu.
 */
export function CommandMenu({
  open,
  onOpenChange,
  groups,
  placeholder = "Search for a page or an action…",
  emptyText = "Nothing matches. Try a page name, a vault or an action.",
}: CommandMenuProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-brand-night/45" />
        <BaseDialog.Popup
          aria-label="Command menu"
          initialFocus={input}
          className={cn(
            // Top-aligned rather than centred, so the field stays put while the list grows and shrinks under it.
            "fixed top-[min(20dvh,160px)] left-1/2 z-50 flex max-h-[calc(100dvh-min(20dvh,160px)-1rem)] w-[calc(100vw-2rem)] max-w-[600px] -translate-x-1/2 flex-col",
            "overflow-hidden rounded-xl bg-raised shadow-4 outline-none",
          )}
        >
          {/* Mounted only while open, so the query starts empty every time. */}
          <CommandSearch
            input={input}
            groups={groups}
            placeholder={placeholder}
            emptyText={emptyText}
            onRun={(item) => {
              item.onSelect();
              onOpenChange(false);
            }}
          />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

function CommandSearch({
  input,
  groups,
  placeholder,
  emptyText,
  onRun,
}: {
  input: RefObject<HTMLInputElement | null>;
  groups: CommandGroup[];
  placeholder: string;
  emptyText: string;
  onRun: (item: CommandItem) => void;
}) {
  const [query, setQuery] = useState("");

  // Groups with no match are dropped whole, so a group title never sits over an empty list.
  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return groups;

    return groups
      .map((group) => ({ ...group, items: group.items.filter((item) => matches(item, words)) }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return (
    <Autocomplete.Root
      inline
      open
      items={groups}
      filteredItems={filtered}
      value={query}
      onValueChange={setQuery}
      itemToStringValue={(item: CommandItem) => item.label}
      // The first match is always active, so Enter runs it straight after typing.
      autoHighlight="always"
      keepHighlight
    >
      <div className="flex items-center gap-2.5 border-b border-line-subtle px-4">
        <Icon name="search" size={16} className="shrink-0 text-fg-subtle" />
        <Autocomplete.Input
          ref={input}
          aria-label="Search commands"
          placeholder={placeholder}
          className="h-12 min-w-0 flex-1 bg-transparent type-body-m text-fg outline-none placeholder:text-fg-subtle"
        />
        <BaseDialog.Close
          aria-label="Close"
          className="focus-ring shrink-0 cursor-pointer rounded-[5px]"
        >
          <Kbd>esc</Kbd>
        </BaseDialog.Close>
      </div>

      <Autocomplete.Empty className="empty:hidden">
        <p className="px-4 py-8 text-center type-body-s text-fg-muted">{emptyText}</p>
      </Autocomplete.Empty>

      <Autocomplete.List className="flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain p-1.5 [scroll-padding-block:6px] empty:hidden">
        {(group: CommandGroup) => (
          <Autocomplete.Group key={group.title} items={group.items} className="flex flex-col">
            <Autocomplete.GroupLabel className="px-2.5 pt-1.5 pb-1 type-label-s text-fg-subtle">
              {group.title}
            </Autocomplete.GroupLabel>
            <Autocomplete.Collection>
              {(item: CommandItem) => (
                <Autocomplete.Item
                  key={item.id}
                  value={item}
                  onClick={() => onRun(item)}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 outline-none select-none",
                    // The active row is the selected fill, the same one a chosen sidebar item uses.
                    "data-[highlighted]:bg-selected",
                  )}
                >
                  {item.icon ? (
                    <Icon name={item.icon} size={16} className="shrink-0 text-fg-muted" />
                  ) : null}
                  <span className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span className="shrink-0 type-body-s text-fg">{item.label}</span>
                    {item.hint ? (
                      <span className="min-w-0 truncate type-body-s text-fg-subtle">
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                  {item.shortcut ? <KbdCombo keys={item.shortcut} /> : null}
                </Autocomplete.Item>
              )}
            </Autocomplete.Collection>
          </Autocomplete.Group>
        )}
      </Autocomplete.List>

      {/* For sighted keyboard users; the combobox role already tells a screen reader how to move and run. */}
      <div
        aria-hidden="true"
        className="hidden items-center gap-4 border-t border-line-subtle bg-canvas/60 px-4 py-2 type-caption text-fg-subtle tablet:flex"
      >
        <span className="flex items-center gap-1.5">
          <KbdCombo keys={moveKeys} /> to move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd> to run
        </span>
      </div>
    </Autocomplete.Root>
  );
}

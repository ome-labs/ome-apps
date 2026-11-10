import { useDeferredValue, useState } from "react";

import { Icon, iconNames, iconSizes, type IconName, type IconSize } from "@ome-labs/icons/web";
import { Button, SegmentedControl, TextInput } from "@ome-labs/ui-web";

import { ActionButton } from "../bench/action-button.tsx";
import { Page, Toolbar } from "../bench/page.tsx";
import { copyText } from "../clipboard/copy-text.ts";
import { downloadSvg, svgMarkup } from "../download/svg.ts";

const sizeOptions = iconSizes.map((size) => ({
  value: String(size) as `${IconSize}`,
  label: `${size}`,
}));

async function downloadIcon(name: IconName, size: IconSize) {
  downloadSvg(await svgMarkup(<Icon name={name} size={size} />), `ome-icon-${name}`);
}

function IconTile({ name, size }: { name: IconName; size: IconSize }) {
  const jsx = `<Icon name="${name}"${size === 20 ? "" : ` size={${size}}`} />`;

  return (
    <div className="group/tile relative">
      <button
        type="button"
        onClick={() => void copyText(name, `Copied ${name}`)}
        className="focus-ring flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg bg-surface px-2 pt-6 pb-3 text-fg shadow-1 transition-shadow duration-base ease-standard hover:shadow-2 active:shadow-pressed"
      >
        <span className="grid h-8 place-items-center">
          <Icon name={name} size={size} />
        </span>
        <span className="w-full truncate text-center type-mono-s text-fg-subtle">{name}</span>
      </button>
      <div className="absolute top-1 right-1 flex [@media(hover:hover)]:opacity-0 transition-opacity duration-fast group-focus-within/tile:opacity-100 group-hover/tile:opacity-100">
        <ActionButton
          label="Copy JSX"
          icon="code"
          onClick={() => void copyText(jsx, "Copied JSX")}
        />
        <ActionButton
          label="Download SVG"
          icon="download"
          onClick={() => void downloadIcon(name, size)}
        />
      </div>
    </div>
  );
}

export function IconsPage() {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<`${IconSize}`>("20");
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const shown = iconNames.filter((name) => name.includes(deferred));

  return (
    <Page
      title="Icons"
      description={`The kit's ${iconNames.length} icons, each a Hugeicons stroke icon on a 24 grid at 1.5 stroke, under the name Ome code uses. Click an icon to copy its name; hover for its JSX and SVG. SVGs draw in currentColor.`}
    >
      <div className="flex flex-col gap-8">
        <Toolbar>
          <TextInput
            aria-label="Search icons"
            placeholder={`Search ${iconNames.length} icons`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full max-w-72"
          />
          <SegmentedControl
            aria-label="Icon size"
            value={size}
            onValueChange={setSize}
            options={sizeOptions}
          />
          <span className="ml-auto type-mono-s text-fg-subtle">
            {shown.length} / {iconNames.length}
          </span>
        </Toolbar>

        {shown.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {shown.map((name) => (
              <IconTile key={name} name={name} size={Number(size) as IconSize} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="type-body-m text-fg-muted">No icon is named like “{query}”.</p>
            <Button size="sm" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
}

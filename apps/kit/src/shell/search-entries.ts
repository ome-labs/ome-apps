import type { IconName } from "@ome-labs/icons/web";

import { slug } from "../bench/slug.ts";
import { loadExampleSets } from "../examples/catalog.ts";
import { navItems } from "../nav.ts";

export type SearchEntry = {
  id: string;
  title: string;
  detail: string;
  group: string;
  icon: IconName;
  to: string;
  hash?: string;
};

export const pageEntries: SearchEntry[] = navItems.map((item) => ({
  id: item.to,
  title: item.title,
  detail: item.description,
  group: item.group,
  icon: item.icon,
  to: item.to,
}));

/** Each component example, linked to its heading on its page. Loads the example sets the first time. */
export async function loadExampleEntries(): Promise<SearchEntry[]> {
  const sets = await loadExampleSets();

  return navItems.flatMap((item) => {
    const set = sets[item.to.replace("/components/", "")];
    if (!item.to.startsWith("/components/") || !set) return [];

    return set.examples.map((entry) => ({
      id: `${item.to}#${slug(entry.title)}`,
      title: entry.title,
      detail: item.title,
      group: "Examples",
      icon: item.icon,
      to: item.to,
      hash: slug(entry.title),
    }));
  });
}

/** Every word of the query must appear in the title, the detail or the group. */
export function matches(entry: SearchEntry, query: string) {
  const haystack = `${entry.title} ${entry.detail} ${entry.group}`.toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** One design token as the DTCG format writes it, with its dotted path. */
export type Token = {
  path: string;
  type: string;
  value: unknown;
  description?: string;
  extensions: Record<string, unknown>;
};

type Node = { [key: string]: unknown };

/** Reads every `tokens/*.json` file and lists their tokens, in file order. */
export function readTokens(directory: string): Token[] {
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .toSorted();

  return files.flatMap((file) => {
    const tree = JSON.parse(readFileSync(join(directory, file), "utf8")) as Node;
    return collect(tree, []);
  });
}

// A node with `$value` is a token; anything else is a group. Keys starting with `$` are metadata.
function collect(node: Node, path: string[]): Token[] {
  if ("$value" in node) {
    return [
      {
        path: path.join("."),
        type: String(node.$type),
        value: node.$value,
        ...(typeof node.$description === "string" ? { description: node.$description } : {}),
        extensions: (node.$extensions ?? {}) as Record<string, unknown>,
      },
    ];
  }

  return Object.entries(node)
    .filter(([key, child]) => !key.startsWith("$") && typeof child === "object" && child !== null)
    .flatMap(([key, child]) => collect(child as Node, [...path, key]));
}

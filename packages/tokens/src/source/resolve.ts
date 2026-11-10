import type { Token } from "./tree.ts";

const reference = /^\{([^}]+)\}$/;

/** Follows `{group.token}` references until a literal value, failing on unknown or circular ones. */
export function resolve(
  value: unknown,
  byPath: ReadonlyMap<string, Token>,
  seen: string[] = [],
): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const match = reference.exec(value);
  if (!match?.[1]) {
    return value;
  }

  const path = match[1];
  if (seen.includes(path)) {
    throw new Error(`Circular token reference: ${[...seen, path].join(" → ")}`);
  }

  const target = byPath.get(path);
  if (!target) {
    throw new Error(
      `Unknown token reference {${path}}${seen.length ? ` (from ${seen.at(-1)})` : ""}`,
    );
  }

  return resolve(target.value, byPath, [...seen, path]);
}

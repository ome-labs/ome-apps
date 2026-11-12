import type { AvatarArt } from "../art/art-files.ts";

/** The members in the site's stories, each with one of the kit's profile avatars. */
export const people = {
  alice: { name: "Alice", avatar: "heron" },
  bob: { name: "Bob", avatar: "axolotl" },
  charlie: { name: "Charlie", avatar: "fox" },
  dana: { name: "Dana", avatar: "owl" },
  eve: { name: "Eve", avatar: "jaguar" },
} as const satisfies Record<string, { name: string; avatar: AvatarArt }>;

export type Person = keyof typeof people;

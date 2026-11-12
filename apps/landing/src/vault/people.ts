/** The members in the site's stories, with their avatar colours from the brand's warm and lake tones. */
export const people = {
  alice: { name: "Alice", initial: "A", colour: "#FCEFD6" },
  bob: { name: "Bob", initial: "B", colour: "#C4D3F6" },
  charlie: { name: "Charlie", initial: "C", colour: "#F5C98A" },
  dana: { name: "Dana", initial: "D", colour: "#9DB4F2" },
} as const;

export type Person = keyof typeof people;

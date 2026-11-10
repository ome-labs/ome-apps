/** "Depth & spacing" → "depth-spacing": ids for headings and file names for downloads. */
export function slug(text: string) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

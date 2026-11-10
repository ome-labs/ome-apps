import { toast } from "@ome-labs/ui-web";

/** Copies `value` and says so in a toast, showing what was copied so a wrong click is obvious. */
export async function copyText(value: string, label = "Copied") {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(label, { description: value.length > 80 ? `${value.slice(0, 80)}…` : value });
    return true;
  } catch {
    toast.error("Couldn't copy", { description: "The browser blocked clipboard access." });
    return false;
  }
}

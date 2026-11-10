import { toast } from "@ome-labs/ui-web";

import { saveBlob } from "./save.ts";

/**
 * Downloads a shipped asset file as it is. The URL comes from the bundle (same origin), so fetching it and saving
 * the blob names the file properly, which a plain `<a download>` doesn't do for every browser.
 */
export async function downloadFile(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}`);

    saveBlob(await response.blob(), fileName);
  } catch {
    toast.error(`Couldn't download ${fileName}`);
  }
}

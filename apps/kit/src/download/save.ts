import { toast } from "@ome-labs/ui-web";

/** Hands a blob to the browser as a file download, then says what was saved. */
export function saveBlob(blob: Blob, fileName: string, detail?: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();

  // Revoking straight away can cancel the download in Safari, so the URL lives a moment longer.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success(`Downloaded ${fileName}`, detail ? { description: detail } : undefined);
}

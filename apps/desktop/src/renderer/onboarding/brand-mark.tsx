import { Logo } from "@ome-labs/brand/web";
import { useTheme } from "@ome-labs/ui-web";

/** The two-tone Ome mark, in the version drawn for the current theme's surfaces. */
export function BrandMark({ className }: { className?: string }) {
  const { resolved } = useTheme();
  return <Logo variant="mark" tone={resolved} title="Ome" className={className} />;
}

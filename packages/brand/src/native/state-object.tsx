import { useMemo } from "react";

import { Image, type ImageProps } from "react-native";

import { stateObjectSources } from "../generated/native/assets.ts";
import { manifest, type StateObjectId } from "../manifest.ts";

type StateObjectProps = Omit<ImageProps, "source" | "alt" | "width" | "height"> & {
  id: StateObjectId;
  /** Which drawing: pass the resolved app theme. */
  theme?: "light" | "dark" | undefined;
  /** The longest side in points. Leave it out for the drawing's own size. */
  size?: number | undefined;
  /** Overrides the manifest's alt text; pass "" when the object is decorative. */
  alt?: string | undefined;
};

/** One of the kit's state objects, in the drawing for the given theme. Metro picks @1x or @2x by density. */
export function StateObject({ id, theme = "light", size, alt, style, ...props }: StateObjectProps) {
  const entry = manifest.stateObjects.find((item) => item.id === id);
  const drawing = entry?.[theme];
  const label = alt ?? entry?.alt ?? "";
  const scale = drawing && size ? size / Math.max(drawing.width, drawing.height) : 1;
  const width = drawing ? Math.round(drawing.width * scale) : undefined;
  const height = drawing ? Math.round(drawing.height * scale) : undefined;
  const sized = useMemo(() => [{ width, height }, style], [width, height, style]);

  return (
    <Image
      source={stateObjectSources[id][theme]}
      accessible={label !== ""}
      accessibilityLabel={label}
      resizeMode="contain"
      style={sized}
      {...props}
    />
  );
}

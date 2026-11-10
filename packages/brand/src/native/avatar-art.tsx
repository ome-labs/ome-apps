import { SvgXml } from "react-native-svg";

import { avatarXml } from "../generated/native/assets.ts";
import { manifest, type AvatarId } from "../manifest.ts";

type AvatarArtProps = {
  id: AvatarId;
  /** Size in points. */
  size: number;
  alt?: string;
};

/** One of the kit's avatars, drawn as SVG so it stays sharp at any density; the caller rounds it. */
export function AvatarArt({ id, size, alt }: AvatarArtProps) {
  const label = alt ?? manifest.avatars.find((item) => item.id === id)?.alt ?? "";

  return (
    <SvgXml
      xml={avatarXml[id]}
      width={size}
      height={size}
      accessible={label !== ""}
      accessibilityLabel={label}
    />
  );
}

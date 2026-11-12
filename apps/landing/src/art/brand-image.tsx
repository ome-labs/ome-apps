import { avatarSource, objectSource, type AvatarArt, type ObjectArt } from "./art-files.ts";

type BrandImageProps = ({ avatar: AvatarArt } | { object: ObjectArt }) & {
  className?: string | undefined;
};

/**
 * One of the kit's avatars or pixel objects, always decorative: a name or label sits beside it. Sized by its class;
 * the drawings are vector, so they stay sharp at any size.
 */
export function BrandImage(props: BrandImageProps) {
  const src = "avatar" in props ? avatarSource(props.avatar) : objectSource(props.object);

  return (
    <img src={src} alt="" width={64} height={64} decoding="async" className={props.className} />
  );
}

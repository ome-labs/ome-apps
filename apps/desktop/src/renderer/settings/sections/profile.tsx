import { useCallback, useState } from "react";

import type { Profile as ProfileData } from "@ome-labs/api";
import type { AvatarId } from "@ome-labs/brand/web";
import { Address, Avatar, Button, QrButton } from "@ome-labs/ui-web";

import { AvatarPicker } from "../../avatars/avatar-picker.tsx";
import { useAvatars, useProfileAvatar } from "../../avatars/avatars.ts";
import { unwrap } from "../../data/session.ts";
import { Row, Section, Value } from "../parts.tsx";

/** Who this profile is. The name is set when the profile is made; the daemon has no way to change it. */
export function Profile({ profile }: { profile: ProfileData }) {
  const switchProfile = useCallback(() => void unwrap(window.ome.session.leave()), []);
  const avatars = useAvatars();
  const picture = useProfileAvatar(profile.name);
  const [picking, setPicking] = useState(false);
  const openPicker = useCallback(() => setPicking(true), []);
  const selected = picture?.kind === "art" ? (picture.id as AvatarId) : undefined;

  return (
    <Section id="profile" title="Profile">
      <Row title="Picture" description="Only on this computer.">
        <Avatar name={profile.name} source={picture} size={40} />
        <Button onClick={openPicker}>Change</Button>
      </Row>
      <Row title="Name" description="What other members see.">
        <Value>{profile.name}</Value>
      </Row>
      <Row title="Aztec account" description="Your own address on Aztec. Fees are covered for you.">
        <Address address={profile.account} copy />
        <QrButton
          value={profile.account}
          label="address"
          title="Your Aztec account"
          description="Scan it to get this address on another device."
        />
      </Row>
      <Row title="Switch profile" description="Open another member on this computer.">
        <Button icon="user-switch" onClick={switchProfile}>
          Switch
        </Button>
      </Row>
      <AvatarPicker
        kind="profile"
        name={profile.name}
        open={picking}
        onOpenChange={setPicking}
        selected={selected}
        target={PROFILE_TARGET}
        removable={avatars?.profile !== null && avatars?.profile !== undefined}
      />
    </Section>
  );
}

const PROFILE_TARGET = { kind: "profile" } as const;

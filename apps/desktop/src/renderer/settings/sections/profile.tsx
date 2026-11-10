import { useCallback } from "react";

import type { Profile as ProfileData } from "@ome-labs/api";
import { Address, Button } from "@ome-labs/ui-web";

import { unwrap } from "../../data/session.ts";
import { Row, Section, Value } from "../parts.tsx";

/** Who this profile is. The name is set when the profile is made; the daemon has no way to change it. */
export function Profile({ profile }: { profile: ProfileData }) {
  const switchProfile = useCallback(() => void unwrap(window.ome.session.leave()), []);

  return (
    <Section id="profile" title="Profile">
      <Row title="Name" description="What other members see.">
        <Value>{profile.name}</Value>
      </Row>
      <Row title="Aztec account" description="Sends your transactions.">
        <Address address={profile.account} copy />
      </Row>
      <Row title="Switch profile" description="Open another member on this computer.">
        <Button onClick={switchProfile}>Switch…</Button>
      </Row>
    </Section>
  );
}

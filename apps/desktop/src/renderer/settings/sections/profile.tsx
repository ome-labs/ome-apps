import { useCallback } from "react";

import type { DaemonInfo, Profile as ProfileData } from "@ome-labs/api";
import { Address, Button } from "@ome-labs/ui-web";

import { unwrap } from "../../data/session.ts";
import { Row, Section, Value } from "../parts.tsx";

/** Who this profile is. The name is set when the profile is made; the daemon has no way to change it. */
export function Profile({ profile, info }: { profile: ProfileData; info: DaemonInfo | undefined }) {
  const switchProfile = useCallback(() => void unwrap(window.ome.session.leave()), []);

  return (
    <Section id="profile" title="Profile" description="One profile is one member on this computer.">
      <Row title="Name" description="What the other members see on rosters and votes.">
        <Value>{profile.name}</Value>
      </Row>
      <Row
        title="Your Aztec account"
        description="Sends your transactions, such as deploying a vault you host. Fees are sponsored."
      >
        <Address address={profile.account} copy />
      </Row>
      <Row title="Created">
        <Value>
          {new Date(profile.createdAt * 1000).toLocaleDateString(undefined, { dateStyle: "long" })}
        </Value>
      </Row>
      {info ? (
        <Row title="Folder">
          <Value mono>{info.profileDir}</Value>
        </Row>
      ) : null}
      <Row
        title="Switch profile"
        description="Open another member's profile on this computer, or set up a new one."
      >
        <Button onClick={switchProfile}>Switch…</Button>
      </Row>
    </Section>
  );
}

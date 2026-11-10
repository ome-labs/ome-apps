import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { Avatar, Banner, Button } from "@ome-labs/ui-web";

import type { AvatarChoice, ProfileSummary } from "../../bridge/contract.ts";
import { asSource, defaultProfileArt, useProfilePictures } from "../avatars/avatars.ts";
import { unwrap, useSession } from "../data/session.ts";
import { OnboardingLayout, StepHeading } from "./layout.tsx";

/** `/profiles`: several members use this computer; pick whose Ome to open. */
export function Profiles() {
  const state = useSession();
  const profiles = state?.phase === "choose" ? state.profiles : [];
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const setUp = useCallback(() => void navigate({ to: "/welcome" }), [navigate]);
  const pictures = useProfilePictures();

  return (
    <OnboardingLayout sceneId="profiles">
      <StepHeading title="Who's using Ome?">
        Each profile is one member, with its own daemon, keys and vaults.
      </StepHeading>
      {error ? <Banner kind="alarm">{error}</Banner> : null}
      <ul className="flex flex-col gap-2">
        {profiles.map((profile) => (
          <li key={profile.name}>
            <ProfileButton
              profile={profile}
              picture={pictures?.[profile.name]}
              onError={setError}
            />
          </li>
        ))}
      </ul>
      <div>
        <Button variant="ghost" icon="plus" onClick={setUp}>
          Set up another member
        </Button>
      </div>
    </OnboardingLayout>
  );
}

function ProfileButton({
  profile,
  picture,
  onError,
}: {
  profile: ProfileSummary;
  picture: AvatarChoice | undefined;
  onError: (message: string) => void;
}) {
  const source = useMemo(
    () =>
      picture ? asSource(picture) : { kind: "art" as const, id: defaultProfileArt(profile.member) },
    [picture, profile.member],
  );
  const open = useCallback(() => {
    unwrap(window.ome.session.open(profile.name)).catch((error: unknown) =>
      onError(error instanceof Error ? error.message : String(error)),
    );
  }, [onError, profile.name]);

  return (
    <button
      type="button"
      onClick={open}
      className="focus-ring flex w-full items-center gap-3 rounded-lg bg-surface px-4 py-3 text-left shadow-1 transition-[background-color] duration-fast ease-standard hover:bg-hover"
    >
      <Avatar name={profile.member} source={source} size={40} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-label-m text-fg">{profile.member}</span>
        <span className="truncate type-mono-s text-fg-subtle">{profile.name}</span>
      </span>
    </button>
  );
}

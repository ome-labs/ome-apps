import { useCallback, useEffect, useState } from "react";

import type { NodeStatus } from "@ome-labs/api";

import type { Preflight } from "../../bridge/contract.ts";
import { Intro } from "./intro.tsx";
import { OnboardingLayout } from "./layout.tsx";
import { PassphraseStep } from "./passphrase-step.tsx";
import { type ProfileDraft, ProfileStep } from "./profile-step.tsx";
import { ServicePills } from "./service-pills.tsx";

type Step = { name: "intro" } | { name: "profile" } | { name: "passphrase"; node: NodeStatus };

const SCENES = { intro: "welcome", profile: "create-profile", passphrase: "passphrase" } as const;

/** `/welcome`: the first run, from what Ome is to an open profile. */
export function Welcome() {
  const [step, setStep] = useState<Step>({ name: "intro" });
  const [draft, setDraft] = useState<ProfileDraft>();
  const [preflight, setPreflight] = useState<Preflight>();
  useEffect(() => {
    void window.ome.session.preflight().then(setPreflight);
  }, []);

  const toIntro = useCallback(() => setStep({ name: "intro" }), []);
  const toProfile = useCallback(() => setStep({ name: "profile" }), []);
  const ready = useCallback((next: ProfileDraft, node: NodeStatus) => {
    setDraft(next);
    setStep({ name: "passphrase", node });
  }, []);

  return (
    <OnboardingLayout
      illustration={SCENES[step.name]}
      footer={<ServicePills preflight={preflight} />}
    >
      {step.name === "intro" ? <Intro preflight={preflight} onStart={toProfile} /> : null}
      {step.name === "profile" ? (
        <ProfileStep draft={draft} onBack={toIntro} onReady={ready} />
      ) : null}
      {step.name === "passphrase" && draft ? (
        <PassphraseStep draft={draft} node={step.node} onBack={toProfile} />
      ) : null}
    </OnboardingLayout>
  );
}

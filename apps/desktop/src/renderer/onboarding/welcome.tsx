import { useCallback, useEffect, useState } from "react";

import type { Preflight } from "../../bridge/contract.ts";
import { openNewProfile } from "../data/session.ts";
import { Intro } from "./intro.tsx";
import { OnboardingLayout } from "./layout.tsx";
import type { Direction } from "./motion.tsx";
import { PassphraseStep } from "./passphrase-step.tsx";
import { type ProfileDraft, ProfileStep } from "./profile-step.tsx";
import { ServicePills } from "./service-pills.tsx";
import { TouchIdStep } from "./touch-id-step.tsx";

/** The Touch ID step holds the passphrase it derives the sealing key from, and drops it with the step. */
type Step =
  | { name: "intro" }
  | { name: "profile" }
  | { name: "passphrase" }
  | { name: "touch-id"; passphrase: string };

const ORDER: Step["name"][] = ["intro", "profile", "passphrase", "touch-id"];

const SCENES = {
  intro: "welcome",
  profile: "create-profile",
  passphrase: "passphrase",
  "touch-id": "touch-id",
} as const;

/** `/welcome`: the first run, from what Ome is to an open profile. */
export function Welcome() {
  const [step, setStepState] = useState<Step>({ name: "intro" });
  const [direction, setDirection] = useState<Direction>(1);
  const setStep = useCallback((next: Step) => {
    setStepState((current) => {
      setDirection(ORDER.indexOf(next.name) >= ORDER.indexOf(current.name) ? 1 : -1);
      return next;
    });
  }, []);
  const [draft, setDraft] = useState<ProfileDraft>();
  const [preflight, setPreflight] = useState<Preflight>();
  // Touch ID adds a third step on Macs that have it.
  const [touchId, setTouchId] = useState(false);
  useEffect(() => {
    void window.ome.session.preflight().then(setPreflight);
    void window.ome.touchId.state().then((state) => setTouchId(state.available));
  }, []);
  const total = touchId ? 3 : 2;

  const toIntro = useCallback(() => setStep({ name: "intro" }), [setStep]);
  const toProfile = useCallback(() => setStep({ name: "profile" }), [setStep]);
  const ready = useCallback(
    (next: ProfileDraft) => {
      setDraft(next);
      setStep({ name: "passphrase" });
    },
    [setStep],
  );
  const created = useCallback(
    async (typed: string) => {
      if (!touchId) return openNewProfile();
      setStep({ name: "touch-id", passphrase: typed });
    },
    [setStep, touchId],
  );

  return (
    <OnboardingLayout
      illustration={SCENES[step.name]}
      stepKey={step.name}
      direction={direction}
      footer={<ServicePills preflight={preflight} />}
    >
      {step.name === "intro" ? <Intro preflight={preflight} onStart={toProfile} /> : null}
      {step.name === "profile" ? (
        <ProfileStep
          position={`Step 1 of ${total}`}
          draft={draft}
          onBack={toIntro}
          onReady={ready}
        />
      ) : null}
      {step.name === "passphrase" && draft ? (
        <PassphraseStep
          position={`Step 2 of ${total}`}
          draft={draft}
          onBack={toProfile}
          onCreated={created}
        />
      ) : null}
      {step.name === "touch-id" ? (
        <TouchIdStep position={`Step 3 of ${total}`} passphrase={step.passphrase} />
      ) : null}
    </OnboardingLayout>
  );
}

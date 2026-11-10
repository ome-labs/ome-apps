import { useCallback } from "react";

import { useNavigate } from "@tanstack/react-router";

import { Illustration, type IllustrationId } from "@ome-labs/brand/web";
import { Button, ThresholdChip } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";

/** The vault shapes worth recommending: each survives losing a member and still spends and reads. */
const SHAPES = [
  {
    members: 3,
    approvals: 2,
    read: 2,
    survives: "Lose any one member and you can still spend and read.",
  },
  { members: 5, approvals: 3, read: 3, survives: "Lose any two and you can still spend and read." },
] as const;

/** `/home`: where a member without a vault starts. Create one, join one by invite, or ask to join an existing one. */
export function HomePage() {
  const status = useOme("status", {});
  const navigate = useNavigate();
  const go = useCallback((to: string) => () => void navigate({ to }), [navigate]);
  const name = status.data?.profile?.name;

  return (
    <div className="flex max-w-[1040px] flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="type-heading-xl text-fg">{name ? `Welcome, ${name}` : "Welcome"}</h1>
        <p className="type-body-m text-fg-muted">
          You're not in a vault yet. Start one, or join one you were invited to.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-5">
        <Way
          illustration="create-vault"
          title="Create a vault"
          text="Start a vault and invite co-founders."
          action={
            <Button variant="primary" icon="plus" onClick={go("/create")}>
              Create vault
            </Button>
          }
        />
        <Way
          illustration="invite"
          title="Join a vault"
          text="Paste an invite from a co-founder."
          action={
            <Button icon="link" onClick={go("/join")}>
              Paste invite
            </Button>
          }
        />
        <Way
          illustration="join-request"
          title="Join an existing vault"
          text="Send a join request to one of its members."
          action={
            <Button icon="user-plus" onClick={go("/join-request")}>
              Make request
            </Button>
          }
        />
      </div>

      <section className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1">
        <header className="flex flex-col gap-1">
          <h2 className="type-heading-s text-fg">Choosing thresholds</h2>
          <p className="type-body-s text-fg-muted">
            How many members approve a payment, and how many it takes to read.
          </p>
        </header>
        <div className="grid grid-cols-2 gap-4">
          {SHAPES.map((shape) => (
            <div
              key={shape.members}
              className="flex flex-col gap-3 rounded-md bg-sunken p-4 shadow-field"
            >
              <span className="type-label-m text-fg">{shape.members} members</span>
              <div className="flex flex-wrap gap-2">
                <ThresholdChip kind="spend" threshold={shape.approvals} members={shape.members} />
                <ThresholdChip kind="read" threshold={shape.read} members={shape.members} />
              </div>
              <span className="type-body-s text-fg-muted">{shape.survives}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Way({
  illustration,
  title,
  text,
  action,
}: {
  illustration: IllustrationId;
  title: string;
  text: string;
  action: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1">
      <Illustration
        id={illustration}
        alt=""
        className="aspect-[8/5] w-full rounded-md object-cover"
      />
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="type-heading-s text-fg">{title}</h2>
        <p className="type-body-s text-fg-muted">{text}</p>
      </div>
      <div>{action}</div>
    </article>
  );
}

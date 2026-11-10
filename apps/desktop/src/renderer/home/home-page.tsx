import { type ReactNode, useCallback } from "react";

import { useNavigate } from "@tanstack/react-router";

import { Button } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";
import { type Placed, WayScene } from "./way-scene.tsx";

// Each way in, as a small still life: what you do, drawn with the kit's objects.
const CREATE: Placed[] = [
  { id: "vault", size: 96, x: 50, y: 56 },
  { id: "key", size: 48, x: 82, y: 72 },
  { id: "star", size: 48, x: 17, y: 30 },
];
const JOIN: Placed[] = [
  { id: "paper-boat", size: 96, x: 42, y: 58 },
  { id: "envelope", size: 48, x: 82, y: 32 },
];
const REQUEST: Placed[] = [
  { id: "bridge", size: 96, x: 50, y: 60 },
  { id: "lantern", size: 48, x: 15, y: 40 },
  { id: "heron", size: 48, x: 85, y: 42 },
];

/** `/home`: where a member without a vault starts. Create one, join one by invite, or ask to join an existing one. */
export function HomePage() {
  const status = useOme("status", {});
  const navigate = useNavigate();
  const go = useCallback((to: string) => () => void navigate({ to }), [navigate]);
  const name = status.data?.profile?.name;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="type-heading-xl text-fg">{name ? `Welcome, ${name}` : "Welcome"}</h1>
        <p className="type-body-m text-fg-muted">
          You're not in a vault yet. Start one, or join one you were invited to.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-5">
        <Way
          scene={<WayScene texture="glow" objects={CREATE} />}
          title="Create a vault"
          text="Start a vault and invite co-founders."
          action={
            <Button variant="primary" icon="plus" onClick={go("/create")}>
              Create vault
            </Button>
          }
        />
        <Way
          scene={<WayScene texture="water" objects={JOIN} />}
          title="Join a vault"
          text="Paste an invite from a co-founder."
          action={
            <Button icon="link" onClick={go("/join")}>
              Paste invite
            </Button>
          }
        />
        <Way
          scene={<WayScene texture="stars" objects={REQUEST} />}
          title="Join an existing vault"
          text="Send a join request to one of its members."
          action={
            <Button icon="user-plus" onClick={go("/join-request")}>
              Make request
            </Button>
          }
        />
      </div>
    </div>
  );
}

function Way({
  scene,
  title,
  text,
  action,
}: {
  scene: ReactNode;
  title: string;
  text: string;
  action: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1">
      {scene}
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="type-heading-s text-fg">{title}</h2>
        <p className="type-body-s text-fg-muted">{text}</p>
      </div>
      <div>{action}</div>
    </article>
  );
}

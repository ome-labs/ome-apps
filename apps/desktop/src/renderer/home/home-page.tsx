import { type ReactNode, useCallback } from "react";

import { useNavigate } from "@tanstack/react-router";

import { Scene } from "@ome-labs/brand/web";
import { Button } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";

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
          scene={
            <Scene
              id="create-vault"
              alt=""
              className="aspect-[16/9] w-full rounded-md object-cover"
            />
          }
          title="Create a vault"
          text="Start a vault and invite co-founders."
          action={
            <Button variant="primary" icon="plus" onClick={go("/create")}>
              Create vault
            </Button>
          }
        />
        <Way
          scene={
            <Scene id="invite" alt="" className="aspect-[16/9] w-full rounded-md object-cover" />
          }
          title="Join a vault"
          text="Paste an invite from a co-founder."
          action={
            <Button icon="link" onClick={go("/join")}>
              Paste invite
            </Button>
          }
        />
        <Way
          scene={
            <Scene
              id="join-request"
              alt=""
              className="aspect-[16/9] w-full rounded-md object-cover"
            />
          }
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

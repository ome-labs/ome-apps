import { useEffect } from "react";

import { PillLink } from "../actions/pill-link.tsx";
import { track } from "../analytics/client.ts";
import { PageHero } from "../layout/page-hero.tsx";

/** A page that isn't there: the lake in mist, and the way home. */
export function NotFound() {
  useEffect(() => {
    track("not_found_viewed", { path: window.location.pathname });
  }, []);

  return (
    <PageHero
      hour="5:58 am"
      label="Lost in the mist"
      scene="welcome"
      title={
        <>
          Nothing on <em>this shore.</em>
        </>
      }
      sub="The page you followed isn’t here. It may have moved, or it was never built."
      actions={
        <>
          <PillLink to="/">Back home</PillLink>
          <PillLink to="/how-it-works" kind="ghost">
            How it works
          </PillLink>
        </>
      }
    />
  );
}

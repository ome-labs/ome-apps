import { PillLink } from "../actions/pill-link.tsx";
import { PageHero } from "../heroes/page-hero.tsx";

/** A page that isn't there: the lake in mist, and the way home. */
export function NotFound() {
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
          <PillLink to="/install" kind="ghost">
            Install
          </PillLink>
        </>
      }
    />
  );
}

import type { ComponentType } from "react";

import { Actions } from "./actions.tsx";
import { Feedback } from "./feedback.tsx";
import { Forms } from "./forms.tsx";
import { Lists } from "./lists.tsx";
import { Signing } from "./signing.tsx";
import { Values } from "./values.tsx";

/** The kit's screens, one per group of components, in the order the home screen lists them. */
export const sections = [
  { slug: "signing", title: "Review and signing", Screen: Signing },
  { slug: "values", title: "Values and statuses", Screen: Values },
  { slug: "lists", title: "Lists", Screen: Lists },
  { slug: "actions", title: "Actions", Screen: Actions },
  { slug: "forms", title: "Forms", Screen: Forms },
  { slug: "feedback", title: "Feedback and surfaces", Screen: Feedback },
] as const satisfies { slug: string; title: string; Screen: ComponentType }[];

import { useId, useState } from "react";

import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";
import { motion } from "motion/react";

import { faq } from "./faq.ts";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The questions as an accordion, one open at a time, the first to start with. Every answer stays in the page while
 * closed (collapsed and inert), so the prerendered page and search engines have them all.
 */
export function FaqList() {
  const [open, setOpen] = useState<number | undefined>(0);
  const id = useId();

  return (
    <div className="glass-soft w-full rounded-[22px] px-4 md:rounded-[26px] md:px-6">
      {faq.map((item, index) => {
        const expanded = open === index;

        return (
          <div key={item.question} className="border-t border-white/14 first:border-t-0">
            <h3>
              <button
                type="button"
                id={`${id}-q${index}`}
                aria-expanded={expanded}
                aria-controls={`${id}-a${index}`}
                onClick={() => setOpen(expanded ? undefined : index)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg py-5 text-left text-[17px] font-semibold md:py-[22px] md:text-lg"
              >
                {item.question}
                <Icon
                  name="plus"
                  size={20}
                  className={cn(
                    "shrink-0 transition-[transform,color] duration-300 ease-emphasized",
                    expanded ? "rotate-45 text-amber" : "text-white/70",
                  )}
                />
              </button>
            </h3>
            <motion.section
              id={`${id}-a${index}`}
              aria-labelledby={`${id}-q${index}`}
              inert={!expanded}
              initial={false}
              animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
              transition={{ duration: 0.36, ease }}
              className="overflow-hidden"
            >
              <p className="pr-8 pb-5 text-[15px] leading-[1.6] text-white/85 md:pb-6">
                {item.answer}
              </p>
            </motion.section>
          </div>
        );
      })}
    </div>
  );
}

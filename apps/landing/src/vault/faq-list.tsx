import { Icon } from "@ome-labs/icons/web";

import { faq } from "./faq.ts";

/** The questions as disclosures: native <details>, so they open without script and search engines read them. */
export function FaqList() {
  return (
    <div className="glass-soft w-full rounded-[22px] px-4 md:rounded-[26px] md:px-5">
      {faq.map((item, index) => (
        <details
          key={item.question}
          open={index === 0}
          className="group border-t border-white/18 first:border-t-0"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-5 text-[17px] font-semibold md:py-[22px] md:text-lg [&::-webkit-details-marker]:hidden">
            {item.question}
            <Icon
              name="plus"
              size={20}
              className="shrink-0 text-white/70 transition-transform duration-300 ease-emphasized group-open:rotate-45"
            />
          </summary>
          <p className="pr-8 pb-5 text-[15px] leading-[1.55] text-white/85 md:pb-6">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

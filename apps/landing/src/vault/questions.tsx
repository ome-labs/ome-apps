import { Reveal } from "../layout/reveal.tsx";
import { Seats } from "./seats.tsx";

const questions = [
  {
    kind: "spend",
    ask: "Who can spend?",
    letter: "k",
    body: "Every payment needs k approvals, checked inside the proof. Who signed, and how many had to, never reaches the chain.",
  },
  {
    kind: "read",
    ask: "Who can see?",
    letter: "t",
    body: "Balances appear only when t members’ keepers answer. Nobody ever holds the whole viewing key, including us.",
  },
] as const;

/** The two thresholds side by side: approvals to spend, keepers to read. */
export function Questions() {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-4 md:grid-cols-2 md:gap-6">
      {questions.map((question, index) => (
        <Reveal key={question.kind} delay={index * 80} className="h-full">
          <article className="glass-soft flex h-full flex-col gap-4 rounded-[28px] p-6 md:gap-6 md:p-10">
            <h3 className="font-mono text-xs font-medium tracking-[0.08em] text-haze-soft uppercase">
              {question.ask}
            </h3>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="font-display text-[72px] leading-[0.9] md:text-[120px]">
                <em className="text-brand-sun">{question.letter}</em> of n
              </p>
              <Seats kind={question.kind} lit={3} of={5} />
            </div>
            <p className="text-[15px] leading-[1.5] text-white/90 md:text-[17px]">
              {question.body}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

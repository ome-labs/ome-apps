import { Seats } from "./seats.tsx";

const questions = [
  {
    kind: "spend",
    ask: "Who can spend?",
    letter: "k",
    body: "k members sign each payment. The chain never learns who.",
  },
  {
    kind: "read",
    ask: "Who can see?",
    letter: "t",
    body: "t members answer to read. Nobody holds the whole key.",
  },
] as const;

/** The two thresholds side by side: approvals to spend, keepers to read. */
export function Questions() {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-4 md:grid-cols-2 md:gap-6">
      {questions.map((question) => (
        <article
          key={question.kind}
          className="glass-soft flex flex-col gap-5 rounded-[28px] p-6 md:gap-7 md:p-10"
        >
          <h3 className="font-mono text-xs font-medium tracking-[0.08em] text-haze-soft uppercase">
            {question.ask}
          </h3>
          <p className="font-display text-[72px] leading-[0.9] md:text-[120px]">
            <em className="sun-text">{question.letter}</em> of n
          </p>
          <Seats kind={question.kind} lit={3} />
          <p className="text-[15px] leading-[1.5] text-white/90 md:text-[17px]">{question.body}</p>
        </article>
      ))}
    </div>
  );
}

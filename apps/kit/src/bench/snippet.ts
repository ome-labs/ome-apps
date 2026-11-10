/**
 * The code shown under an example, cut from the example file's own source (imported with `?raw`), so the snippet
 * can never drift from what renders. An example that only returns JSX shows that JSX; one with state or helpers
 * shows the whole function.
 */
export function snippet(source: string, name: string) {
  const start = source.search(new RegExp(`^(export )?function ${name}\\(`, "m"));
  if (start === -1) return "";

  // Example functions are top-level, so the first closing brace at the start of a line ends one.
  const end = source.indexOf("\n}\n", start);
  const whole = source.slice(start, end === -1 ? undefined : end + 2).replace(/^export /, "");

  const onlyReturns = whole.match(/^[^\n]*\{\n {2}return \(\n([\s\S]*)\n {2}\);\n\}$/);
  return onlyReturns?.[1] ? dedent(onlyReturns[1]) : whole;
}

function dedent(text: string) {
  const lines = text.split("\n");
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.length - line.trimStart().length),
  );

  return lines.map((line) => line.slice(indent)).join("\n");
}

// Split a single-line question prompt into "scenario" and "question" paragraphs.
// AWS SAA prompts follow the pattern: <scenario sentences>. <Question word ...?>
// e.g. "A company ... 500 GB. Which solution meets these requirements?"
// We detect the start of the final question sentence (Which/What/How/...) and
// split there. Returns 1 paragraph if no clean split is found.

const QUESTION_STARTERS =
  /^(Which|What|How|Where|Why|When|Who|Can|Does|Do|Is|Are|Will|Should)\b/;

export function splitPromptParagraphs(prompt: string): string[] {
  const trimmed = String(prompt).trim();
  if (!trimmed) return [];

  const lastQuestionMark = trimmed.lastIndexOf("?");
  if (lastQuestionMark <= 0) return [trimmed];

  // Walk back from the question mark to find the start of the question sentence:
  // the position right after the previous ". " (or "! ", "? "), provided the
  // following text starts with a question word.
  for (let i = lastQuestionMark - 1; i >= 1; i--) {
    const ch = trimmed[i];
    const next = trimmed[i + 1];
    if ((ch === "." || ch === "!" || ch === "?") && next === " ") {
      const candidate = trimmed.slice(i + 2);
      if (QUESTION_STARTERS.test(candidate)) {
        const scenario = trimmed.slice(0, i + 1).trim();
        const question = candidate.trim();
        return scenario ? [scenario, question] : [question];
      }
    }
  }

  return [trimmed];
}

export function normalizeAnswerSet(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function isAnswerCorrect(
  selectedAnswers: string[],
  correctAnswers: string[],
): boolean {
  const selected = normalizeAnswerSet(selectedAnswers);
  const correct = normalizeAnswerSet(correctAnswers);

  if (selected.length !== correct.length) {
    return false;
  }

  return selected.every((value, index) => value === correct[index]);
}

export function scoreOutOf1000(
  correctCount: number,
  totalQuestions: number,
): number {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctCount / totalQuestions) * 1000);
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(totalSeconds, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

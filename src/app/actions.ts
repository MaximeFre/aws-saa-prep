"use server";

import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import {
  createAuthSession,
  destroyAuthSession,
  getCurrentUser,
  loginOrRegister,
} from "@/lib/auth";
import {
  createExamSession,
  createQuizSession,
  deleteExamSession,
  finalizeExamSession,
  getExamSessionOwner,
  QuizCreationError,
  saveSessionProgress,
  updateQuestion,
  updateQuestionExplanation,
  type ExamMode,
  type QuestionUpdatePayload,
} from "@/lib/exam-data";

export async function startExamAction(formData: FormData): Promise<void> {
  const rawMode = formData.get("mode");
  const mode: ExamMode = rawMode === "review" ? "review" : "timed";
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  const session = await createExamSession(mode, user.id);

  redirect(`/exam/${session.id}`);
}

export async function startQuizAction(formData: FormData): Promise<void> {
  const rawId = formData.get("cheatsheetId");
  const cheatsheetId = Number(rawId);
  if (!Number.isFinite(cheatsheetId) || cheatsheetId <= 0) {
    redirect("/cheatsheets");
  }
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  const slug = String(formData.get("cheatsheetSlug") ?? "");
  let session: { id: string };
  try {
    session = await createQuizSession(user.id, cheatsheetId);
  } catch (error) {
    if (error instanceof QuizCreationError) {
      redirect(slug ? `/cheatsheets/${slug}?quiz=empty` : "/cheatsheets");
    }
    throw error;
  }
  redirect(`/quiz/${session.id}`);
}

export async function loginAction(formData: FormData): Promise<{
  error: string | null;
}> {
  const pseudo = String(formData.get("pseudo") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await loginOrRegister(pseudo, password);
  if (!result.ok) {
    return { error: result.error };
  }
  await createAuthSession(result.user.id);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroyAuthSession();
  redirect("/");
}

export async function saveExplanationAction(
  questionId: number,
  explanation: string,
): Promise<void> {
  await updateQuestionExplanation(questionId, explanation);
}

export async function updateQuestionAction(
  questionId: number,
  payload: QuestionUpdatePayload,
): Promise<void> {
  await updateQuestion(questionId, payload);
  revalidatePath(`/questions/${questionId}`);
  revalidatePath("/questions");
}

export async function saveProgressAction(
  sessionId: string,
  currentIndex: number,
  entries: Array<{
    questionId: number;
    selected: string[];
    isCorrect: boolean;
    submitted: boolean;
  }>,
): Promise<void> {
  await saveSessionProgress(sessionId, { currentIndex, entries });
}

export async function finalizeExamAction(
  sessionId: string,
  correctCount: number,
  score: number,
  answers: Array<{ questionId: number; selected: string[]; isCorrect: boolean }>,
): Promise<void> {
  await finalizeExamSession(sessionId, correctCount, score, answers);
}

export async function deleteSessionAction(
  sessionId: string,
): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Non connecte." };
  }
  const ownerId = await getExamSessionOwner(sessionId);
  if (ownerId === null) {
    return { error: "Session introuvable." };
  }
  if (ownerId !== user.id) {
    return { error: "Cette session ne t'appartient pas." };
  }
  await deleteExamSession(sessionId);
  revalidatePath(`/users/${encodeURIComponent(user.pseudo)}`);
  return { error: null };
}

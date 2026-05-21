"use server";

import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import {
  createAuthSession,
  destroyAuthSession,
  getCurrentUser,
  loginOrRegister,
  requireAdmin,
  requireMember,
} from "@/lib/auth";
import {
  ALL_ROLES,
  bulkReplaceFlashcards,
  countAdmins,
  createExamSession,
  createFlashcard,
  createQuizSession,
  deleteExamSession,
  deleteFlashcard,
  FLASHCARD_RATINGS,
  finalizeExamSession,
  getExamSessionOwner,
  getFlashcardById,
  QuizCreationError,
  recordFlashcardReview,
  saveSessionProgress,
  setUserRole,
  updateFlashcard,
  updateQuestion,
  updateQuestionExplanation,
  type ExamMode,
  type FlashcardBulkInput,
  type FlashcardInput,
  type FlashcardRating,
  type QuestionUpdatePayload,
  type UserRole,
} from "@/lib/exam-data";

export async function startExamAction(formData: FormData): Promise<void> {
  const rawMode = formData.get("mode");
  const mode: ExamMode = rawMode === "review" ? "review" : "timed";
  const user = await requireMember();
  const session = await createExamSession(mode, user.id);

  redirect(`/exam/${session.id}`);
}

export async function startQuizAction(formData: FormData): Promise<void> {
  const rawId = formData.get("cheatsheetId");
  const cheatsheetId = Number(rawId);
  if (!Number.isFinite(cheatsheetId) || cheatsheetId <= 0) {
    redirect("/cheatsheets");
  }
  const user = await requireMember();
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

export async function setUserRoleAction(
  formData: FormData,
): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  const targetId = Number(formData.get("userId"));
  const role = String(formData.get("role")) as UserRole;
  if (!Number.isFinite(targetId) || targetId <= 0) {
    return { error: "Utilisateur invalide." };
  }
  if (!ALL_ROLES.includes(role)) {
    return { error: "Rôle invalide." };
  }
  if (targetId === admin.id && role !== "admin") {
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      return { error: "Impossible de te rétrograder, tu es le seul admin." };
    }
  }
  await setUserRole(targetId, role);
  revalidatePath("/admin/users");
  return { error: null };
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
  await requireAdmin();
  await updateQuestionExplanation(questionId, explanation);
}

export async function updateQuestionAction(
  questionId: number,
  payload: QuestionUpdatePayload,
): Promise<void> {
  await requireAdmin();
  await updateQuestion(questionId, payload);
  revalidatePath(`/admin/questions/${questionId}`);
  revalidatePath("/admin/questions");
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

export async function rateFlashcardAction(
  flashcardId: number,
  rating: FlashcardRating,
): Promise<{ error: string | null; streak: number | null }> {
  const user = await requireMember();
  if (!FLASHCARD_RATINGS.includes(rating)) {
    return { error: "Note invalide.", streak: null };
  }
  if (!Number.isFinite(flashcardId) || flashcardId <= 0) {
    return { error: "Flashcard introuvable.", streak: null };
  }
  const card = await getFlashcardById(flashcardId);
  if (!card) {
    return { error: "Flashcard introuvable.", streak: null };
  }
  const result = await recordFlashcardReview(user.id, flashcardId, rating);
  return { error: null, streak: result.streak };
}

export async function createFlashcardAction(
  cheatsheetId: number,
  input: FlashcardInput,
): Promise<{ error: string | null; id: number | null }> {
  await requireAdmin();
  if (!Number.isFinite(cheatsheetId) || cheatsheetId <= 0) {
    return { error: "Cheatsheet invalide.", id: null };
  }
  if (!input.question.trim() || !input.answer.trim()) {
    return { error: "Question et réponse requises.", id: null };
  }
  const { id } = await createFlashcard(cheatsheetId, {
    ...input,
    question: input.question.trim(),
    answer: input.answer.trim(),
    hint: input.hint?.trim() ? input.hint.trim() : null,
  });
  revalidatePath(`/admin/flashcards/${cheatsheetId}`);
  return { error: null, id };
}

export async function updateFlashcardAction(
  flashcardId: number,
  input: FlashcardInput,
): Promise<{ error: string | null }> {
  await requireAdmin();
  if (!input.question.trim() || !input.answer.trim()) {
    return { error: "Question et réponse requises." };
  }
  const existing = await getFlashcardById(flashcardId);
  if (!existing) return { error: "Flashcard introuvable." };
  await updateFlashcard(flashcardId, {
    ...input,
    question: input.question.trim(),
    answer: input.answer.trim(),
    hint: input.hint?.trim() ? input.hint.trim() : null,
  });
  revalidatePath(`/admin/flashcards/${existing.cheatsheetId}`);
  return { error: null };
}

export async function deleteFlashcardAction(
  flashcardId: number,
): Promise<{ error: string | null }> {
  await requireAdmin();
  const existing = await getFlashcardById(flashcardId);
  if (!existing) return { error: "Flashcard introuvable." };
  await deleteFlashcard(flashcardId);
  revalidatePath(`/admin/flashcards/${existing.cheatsheetId}`);
  return { error: null };
}

export async function bulkReplaceFlashcardsAction(
  cheatsheetId: number,
  cards: FlashcardBulkInput[],
): Promise<{ error: string | null; inserted: number }> {
  await requireAdmin();
  if (!Number.isFinite(cheatsheetId) || cheatsheetId <= 0) {
    return { error: "Cheatsheet invalide.", inserted: 0 };
  }
  if (!Array.isArray(cards) || cards.length === 0) {
    return { error: "Aucune carte fournie.", inserted: 0 };
  }
  const normalized = cards
    .filter((c) => c.question?.trim() && c.answer?.trim())
    .map((c, i) => ({
      question: c.question.trim(),
      answer: c.answer.trim(),
      hint: c.hint?.trim() ? c.hint.trim() : null,
      position: c.position ?? i + 1,
    }));
  if (normalized.length === 0) {
    return { error: "Toutes les cartes sont vides.", inserted: 0 };
  }
  const { inserted } = await bulkReplaceFlashcards(
    cheatsheetId,
    normalized,
    "generated",
  );
  revalidatePath(`/admin/flashcards/${cheatsheetId}`);
  revalidatePath("/admin/flashcards");
  return { error: null, inserted };
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

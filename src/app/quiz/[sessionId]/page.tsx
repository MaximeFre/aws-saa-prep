import { notFound, redirect } from "next/navigation";

import { ExamRunner } from "@/components/exam-runner";
import { requireMember } from "@/lib/auth";
import {
  getExamSession,
  getExamSessionOwner,
  getSessionProgress,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await requireMember();
  const [session, ownerId, progress] = await Promise.all([
    getExamSession(sessionId),
    getExamSessionOwner(sessionId),
    getSessionProgress(sessionId),
  ]);

  if (!session) {
    notFound();
  }

  if (session.kind !== "quiz") {
    redirect(`/exam/${sessionId}`);
  }

  if (ownerId !== null && ownerId !== user.id) {
    redirect("/");
  }

  return <ExamRunner session={session} initialProgress={progress} />;
}

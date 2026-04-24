import { notFound, redirect } from "next/navigation";

import { ExamRunner } from "@/components/exam-runner";
import { getCurrentUser } from "@/lib/auth";
import {
  getExamSession,
  getExamSessionOwner,
  getSessionProgress,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  const session = getExamSession(sessionId);

  if (!session) {
    notFound();
  }

  const ownerId = getExamSessionOwner(sessionId);
  if (ownerId !== null && ownerId !== user.id) {
    redirect("/");
  }

  const progress = getSessionProgress(sessionId);

  return <ExamRunner session={session} initialProgress={progress} />;
}

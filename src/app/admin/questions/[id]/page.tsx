import { notFound } from "next/navigation";

import { QuestionEditor } from "@/components/question-editor";
import { requireAdmin } from "@/lib/auth";
import { getQuestionDetail } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function AdminQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const questionId = Number.parseInt(id, 10);
  if (!Number.isFinite(questionId)) notFound();
  const question = await getQuestionDetail(questionId);
  if (!question) notFound();

  return <QuestionEditor question={question} />;
}

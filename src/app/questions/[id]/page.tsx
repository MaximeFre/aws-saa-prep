import { notFound } from "next/navigation";

import { QuestionEditor } from "@/components/question-editor";
import { getQuestionDetail } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionId = Number.parseInt(id, 10);
  if (!Number.isFinite(questionId)) notFound();
  const question = await getQuestionDetail(questionId);
  if (!question) notFound();

  return <QuestionEditor question={question} />;
}

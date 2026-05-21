import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Admin"
      hint="Chargement des decks de flashcards…"
      skeletonCount={6}
    />
  );
}

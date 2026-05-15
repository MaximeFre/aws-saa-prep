import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Admin · Question"
      hint="Chargement de l'éditeur…"
      skeletonCount={3}
    />
  );
}

import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Examen"
      hint="On prépare ta session et tes 65 questions…"
      skeletonCount={2}
    />
  );
}

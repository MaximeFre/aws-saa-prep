import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Cheatsheets"
      hint="Récupération des fiches de révision…"
      skeletonCount={9}
      variant="grid"
    />
  );
}

import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Quiz"
      hint="Tirage des questions liées à la cheatsheet…"
      skeletonCount={2}
    />
  );
}

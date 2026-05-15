import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Cheatsheet"
      hint="On charge la fiche et tes stats…"
      skeletonCount={2}
    />
  );
}

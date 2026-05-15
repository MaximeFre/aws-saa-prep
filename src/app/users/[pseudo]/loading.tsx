import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Profil"
      hint="On agrège tes sessions et ta compréhension par thématique…"
      skeletonCount={4}
    />
  );
}

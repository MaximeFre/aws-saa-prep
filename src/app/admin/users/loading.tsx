import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Admin · Utilisateurs"
      hint="Chargement de la liste des comptes…"
      skeletonCount={6}
    />
  );
}

import { PageLoader } from "@/components/page-loader";

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Admin · Questions"
      hint="On scanne la base de questions…"
      skeletonCount={8}
    />
  );
}

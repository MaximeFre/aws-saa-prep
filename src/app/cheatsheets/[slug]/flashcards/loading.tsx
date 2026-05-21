import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flashcards-shell flashcards-shell--loading">
      <div className="flashcards-loader">
        <Loader2 className="spin" size={32} />
        <p>Préparation du deck…</p>
      </div>
    </div>
  );
}

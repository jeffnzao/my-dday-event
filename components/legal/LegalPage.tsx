import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <article className="legal-page">
      <span className="eyebrow">DDAY EVENT · Informations</span>
      <h1>{title}</h1>
      {intro && <p className="legal-intro">{intro}</p>}
      <div className="legal-draft-notice">
        <strong>Document à compléter et à valider avant mise en ligne.</strong>
        <span>Les éléments entre crochets sont des champs éditoriaux, pas des informations définitives.</span>
      </div>
      <div className="legal-content">{children}</div>
      <Link className="text-link" href="/">Retour à l’accueil</Link>
    </article>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CallToAction({
  title = "Les plus beaux souvenirs commencent par une envie.",
  text = "Une arche, quelques fleurs, une lumière douce… Et votre histoire prend sa place.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="closing-cta">
      <span className="eyebrow">Le début de votre histoire</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button button-dark" href="/devis">
        Préparer mon devis <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </section>
  );
}

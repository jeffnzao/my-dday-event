import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/shared/Photo";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { CallToAction } from "@/components/shared/CallToAction";
import { rentalSteps } from "@/lib/data";
import { activeCatalogProducts } from "@/lib/catalog/products";

export const metadata: Metadata = { title: "Comment louer" };

export default function Page() {
  return (
    <>
      <section className="how-hero">
        <div>
          <span className="eyebrow">Comment louer</span>
          <h1>De vos coups de cœur<br /><em>à votre réception.</em></h1>
          <p>Quelques étapes pour imaginer le décor de votre journée. Vous choisissez en ligne, nous vérifions les disponibilités et préparons la suite avec vous.</p>
          <Link className="button button-dark" href="/collection">Découvrir la collection <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <Photo className="how-hero-photo" image={activeCatalogProducts[0].image} sizes="(max-width: 760px) 100vw, 50vw" />
      </section>
      <section className="how-steps section-pad">
        <SectionTitle eyebrow="Un accompagnement à chaque étape">
          Simple à imaginer,<br /><em>facile à préparer.</em>
        </SectionTitle>
        <ol className="steps-list steps-list-large">
          {rentalSteps.map((step) => (
            <li key={step.number}><span className="step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
          ))}
        </ol>
        <p className="availability-note">Votre demande ne réserve pas automatiquement le matériel. La disponibilité est confirmée lors de nos échanges.</p>
      </section>
      <section className="support-section how-support">
        <div className="support-card"><span className="support-symbol">01</span><div><h3>Location seule</h3><p>Vous mettez en place la décoration à votre rythme, avec les pièces choisies.</p></div></div>
        <div className="support-card"><span className="support-symbol">02</span><div><h3>Avec installation</h3><p>Indiquez votre souhait d’accompagnement pour en préciser le périmètre et le tarif.</p></div></div>
      </section>
      <CallToAction title="Prête à imaginer votre décoration ?" text="La première étape, c’est de choisir les détails qui vous ressemblent." />
    </>
  );
}

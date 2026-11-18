import { Photo } from "@/components/shared/Photo";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { CallToAction } from "@/components/shared/CallToAction";
import { inspirations } from "@/lib/data";

export function WeddingsPage() {
  return (
    <>
      <section className="wedding-hero">
        <div className="wedding-hero-copy">
          <span className="eyebrow">Nos mariages</span>
          <h1>Dix histoires d’amour.<br /><em>Mille façons de célébrer.</em></h1>
          <p>Une grande tablée au jardin, un château baigné de lumière, une fête les pieds dans le sable… Chaque couple imagine sa journée à sa façon. Entrez dans ces univers et découvrez les détails qui donnent une âme à la fête.</p>
          <p className="editorial-note">Univers visuels d’inspiration — aucune galerie ne représente un mariage réalisé par MY DDAY EVENT.</p>
        </div>
        <Photo className="wedding-hero-image" image={inspirations[0].image} priority sizes="(max-width: 760px) 100vw, 52vw" />
      </section>
      <section className="inspiration-section section-pad">
        <SectionTitle eyebrow="Six façons de rêver" align="center">
          Quel univers vous ressemble ?
        </SectionTitle>
        <div className="inspiration-grid">
          {inspirations.map((item, index) => (
            <article className={`inspiration-card inspiration-card-${index + 1}`} key={item.style}>
              <Photo className="inspiration-image" image={item.image} sizes="(max-width: 760px) 100vw, 34vw" />
              <div className="inspiration-card-caption">
                <span className="eyebrow">{item.mood}</span>
                <h2>{item.style}</h2>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="image-disclaimer">Images d’inspiration de remplacement — les photographies originales du site de référence ne sont pas incluses.</p>
      </section>
      <CallToAction title="Votre histoire aura ses propres couleurs." text="Gardez les idées qui vous touchent et imaginez les détails de votre journée." />
    </>
  );
}

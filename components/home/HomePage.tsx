"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Flower2, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { CallToAction } from "@/components/shared/CallToAction";
import { Photo } from "@/components/shared/Photo";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { homeContent, rentalSteps } from "@/lib/data";
import { featuredProducts as fallbackFeaturedProducts, getDisplayPrice } from "@/lib/catalog/products";
import { catalogCategories } from "@/lib/catalog/categories";
import { useCatalogSelection } from "@/components/catalog/CatalogSelectionProvider";

function isHomeContent(value: unknown): value is typeof homeContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return (
    ["eyebrow", "title", "titleAccent", "intro", "description", "introductionTitle", "introductionAccent"]
      .every((field) => typeof content[field] === "string") &&
    Array.isArray(content.introduction) &&
    content.introduction.length === 3 &&
    content.introduction.every((paragraph) => typeof paragraph === "string")
  );
}

export function HomePage() {
  const [content, setContent] = useState(homeContent);
  const [contentError, setContentError] = useState<string | null>(null);
  const { products, catalogError } = useCatalogSelection();
  const featuredProducts = products.filter((product) => product.isFeatured);
  const featured = featuredProducts.length ? featuredProducts : fallbackFeaturedProducts;
  const heroProduct = featured[0] ?? fallbackFeaturedProducts[0];
  const secondaryProduct = featured[1] ?? featured[0] ?? fallbackFeaturedProducts[1];

  useEffect(() => {
    let active = true;
    fetch("/api/site-content")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Le contenu éditorial enregistré est indisponible.");
        if (!isHomeContent(result.homeContent)) throw new Error("Le contenu éditorial reçu n’est pas valide.");
        if (active) {
          setContent(result.homeContent);
          setContentError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) setContentError(error instanceof Error ? error.message : "Le contenu éditorial enregistré est indisponible.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>
            {content.title}
            <em>{content.titleAccent}</em>
          </h1>
          <p className="hero-lead">{content.intro}</p>
          <p className="hero-description">{content.description}</p>
          {(contentError || catalogError) && (
            <p className="home-content-status" role="status">
              {contentError ?? catalogError} Le contenu de référence est affiché en attendant la configuration.
            </p>
          )}
          <div className="hero-actions">
            <Link className="button button-dark" href="/collection">
              Découvrir la collection <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a className="text-link" href="#comment-louer">Comment ça marche <ArrowDown size={14} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="hero-visual">
          <Photo className="hero-photo" image={heroProduct.image} priority sizes="(max-width: 760px) 100vw, 56vw" />
          <div className="hero-photo-note">
            <Sparkles aria-hidden="true" size={17} />
            <span>Une fête qui vous ressemble</span>
          </div>
          <span className="hero-side-caption">DDAY EVENT · DÉCORATION & LOCATION</span>
        </div>
        <div className="hero-index"><span>01</span><span className="index-line" /><span>04</span></div>
      </section>

      <div className="promise-strip" aria-label="Les plus de DDAY EVENT">
        <span><Flower2 size={17} aria-hidden="true" /> {products.length} références au catalogue</span>
        <span><Sparkles size={16} aria-hidden="true" /> Quantités au choix</span>
        <span><Heart size={16} aria-hidden="true" /> Avec ou sans installation</span>
      </div>

      <section className="intro-section content-grid">
        <div className="intro-photo-wrap">
          <Photo className="intro-photo" image={heroProduct.image} sizes="(max-width: 760px) 100vw, 48vw" />
          <span className="photo-caption">Les détails font la différence</span>
        </div>
        <div className="intro-copy">
          <SectionTitle eyebrow="Une décoration à votre image">
            {content.introductionTitle} <em>{content.introductionAccent}</em>
          </SectionTitle>
          {content.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Link className="text-link" href="/collection">Explorer la collection <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="product-section section-pad">
        <div className="section-heading-row">
          <SectionTitle eyebrow="Quelques pièces choisies">
            Les premiers coups de cœur de votre grand jour
          </SectionTitle>
          <p>Voici un aperçu de la collection. Retrouvez les pièces et les informations de location dans le catalogue.</p>
        </div>
        <div className="product-grid">
          {featured.slice(0, 4).map((product, index) => (
            <Link className="product-card" href="/collection" key={product.id}>
              <div className="product-image-wrap">
                <Photo className="product-image" image={product.image} sizes="(max-width: 760px) 82vw, 25vw" />
                <span className="product-number">0{index + 1}</span>
                <span className="product-arrow"><ArrowRight size={17} aria-hidden="true" /></span>
                <span className="temporary-image-badge">Photo à remplacer</span>
              </div>
              <span className="product-category">{catalogCategories.find((category) => category.id === product.category)?.shortName}</span>
              <h3>{product.name}</h3>
              <p>{getDisplayPrice(product) ?? (product.pricingStatus === "confirmed" ? "Tarif communiqué sur demande" : "Tarif à confirmer")}</p>
            </Link>
          ))}
        </div>
        <p className="image-disclaimer">Visuels d’inspiration temporaires — les photos et références du catalogue restent à valider.</p>
      </section>

      <section className="moments-section">
        <div className="moments-heading">
          <SectionTitle eyebrow="Penser chaque moment">
            À chaque moment, sa <em>petite étincelle.</em>
          </SectionTitle>
        </div>
        <article className="moment-card moment-card-wide">
          <Photo image={heroProduct.image} className="moment-image" sizes="(max-width: 760px) 100vw, 58vw" />
          <div><span className="eyebrow">La réception</span><h3>Des tables où l’on aime se retrouver</h3><p>Des fleurs, de la lumière et de belles matières : imaginez des tables accueillantes où les conversations se prolongent.</p></div>
        </article>
        <article className="moment-card moment-card-small">
          <Photo image={secondaryProduct.image} className="moment-image" sizes="(max-width: 760px) 100vw, 36vw" />
          <div><span className="eyebrow">Les souvenirs</span><h3>Un coin pour les sourires… et les fous rires</h3><p>Un joli fond, une belle assise, quelques détails choisis : vos proches repartent avec des souvenirs à partager.</p></div>
        </article>
      </section>

      <section className="rental-section section-pad" id="comment-louer">
        <div className="rental-intro">
          <SectionTitle eyebrow="Comment louer">
            De vos coups de cœur à votre réception
          </SectionTitle>
          <p>Vous choisissez en ligne. Nous vérifions les disponibilités et préparons la suite avec vous.</p>
          <Link className="text-link" href="/comment-louer">Découvrir les étapes <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <ol className="steps-list">
          {rentalSteps.map((step) => (
            <li key={step.number}>
              <span className="step-number">{step.number}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
        <p className="availability-note">Votre demande ne réserve pas automatiquement le matériel. La disponibilité est confirmée lors de nos échanges.</p>
      </section>

      <section className="support-section">
        <div className="support-card"><span className="support-symbol">01</span><div><h3>Vous aimez tout préparer ?</h3><p>Choisissez la location seule et mettez en place votre décoration à votre rythme.</p></div></div>
        <div className="support-card"><span className="support-symbol">02</span><div><h3>Vous préférez être accompagnés ?</h3><p>Indiquez votre souhait d’installation dans la demande pour en préciser ensemble le périmètre et le tarif.</p></div></div>
      </section>

      <CallToAction />
    </>
  );
}

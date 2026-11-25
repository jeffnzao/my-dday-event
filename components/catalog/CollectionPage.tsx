import { CallToAction } from "@/components/shared/CallToAction";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { activeCatalogProducts, catalogSettings } from "@/lib/catalog/products";
import { catalogCategories } from "@/lib/catalog/categories";

export function CollectionPage() {
  return (
    <>
      <section className="page-hero collection-hero">
        <span className="eyebrow">La collection</span>
        <h1>Les beaux détails<br /><em>font les grands jours.</em></h1>
        <p>De l’accueil de vos invités au dernier souvenir de la soirée, imaginez votre décor pièce après pièce.</p>
        <p className="editorial-note">
          {activeCatalogProducts.length} références réparties en {catalogCategories.length} univers.
          Les photos proviennent des documents client; tarifs et disponibilités restent à confirmer avant publication.
        </p>
      </section>
      <section className="collection-grid-section section-pad">
        <CatalogBrowser />
        <p className="catalog-source-note">
          Les montants issus de {catalogSettings.sourceDocument} sont conservés dans les données du catalogue.
          Leur nature et leur unité doivent être validées avant tout affichage ou calcul.
        </p>
      </section>
      <CallToAction title="Votre décor commence ici." text="Explorez les univers, gardez vos idées préférées et préparons ensemble votre demande." />
    </>
  );
}

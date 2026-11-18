"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { catalogCategories } from "@/lib/catalog/categories";
import { CatalogProductCard } from "@/components/catalog/CatalogProductCard";
import { useCatalogSelection } from "@/components/catalog/CatalogSelectionProvider";

export function CatalogBrowser() {
  const { products, catalogError } = useCatalogSelection();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("editorial");

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fr");
    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const categoryName = catalogCategories.find((category) => category.id === product.category)?.name ?? "";
      const searchable = [
        product.name,
        product.description,
        ...product.dimensions,
        ...product.colors,
        ...product.variants.map((variant) => variant.name),
        categoryName,
      ].join(" ").toLocaleLowerCase("fr");
      return matchesCategory && (!search || searchable.includes(search));
    });

    return sortOrder === "name"
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, "fr"))
      : filtered;
  }, [products, query, selectedCategory, sortOrder]);

  return (
    <section className="catalog-browser" aria-label="Catalogue des décorations">
      <div className="catalog-controls">
        <label className="catalog-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Rechercher dans la collection</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une décoration, une couleur, une dimension…"
            type="search"
            value={query}
          />
        </label>
        <label className="catalog-sort">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span className="sr-only">Trier les produits</span>
          <select onChange={(event) => setSortOrder(event.target.value)} value={sortOrder}>
            <option value="editorial">Ordre du catalogue</option>
            <option value="name">Nom : A à Z</option>
          </select>
        </label>
      </div>
      <nav className="catalog-category-nav" aria-label="Filtrer par catégorie">
        <button
          aria-pressed={selectedCategory === "all"}
          className={selectedCategory === "all" ? "is-selected" : ""}
          onClick={() => setSelectedCategory("all")}
          type="button"
        >
          Tout le catalogue
        </button>
        {catalogCategories.map((category) => (
          <button
            aria-pressed={selectedCategory === category.id}
            className={selectedCategory === category.id ? "is-selected" : ""}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            type="button"
          >
            {category.shortName}
          </button>
        ))}
      </nav>
      <div className="catalog-results-header" aria-live="polite">
        <span>{visibleProducts.length} référence{visibleProducts.length === 1 ? "" : "s"}</span>
        <span>Disponibilités à confirmer</span>
      </div>
      {catalogError && (
        <p className="catalog-temporary-note" role="status">
          {catalogError} Les références de base restent consultables ; les modifications administratives ne sont pas disponibles.
        </p>
      )}
      {visibleProducts.length > 0 ? (
        <div className="catalog-product-grid">
          {visibleProducts.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="catalog-no-results">Aucune référence ne correspond à cette recherche.</p>
      )}
      <p className="catalog-temporary-note">
        Les illustrations sont des emplacements temporaires, pas des photos de l’inventaire réel.
        Les tarifs et disponibilités restent à confirmer avec MY DDAY EVENT.
      </p>
    </section>
  );
}

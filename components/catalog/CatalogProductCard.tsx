"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { catalogCategories } from "@/lib/catalog/categories";
import { getDisplayPrice } from "@/lib/catalog/products";
import type { CatalogProduct } from "@/lib/catalog/types";
import { Photo } from "@/components/shared/Photo";
import { useCatalogSelection } from "@/components/catalog/CatalogSelectionProvider";

export function CatalogProductCard({ product }: { product: CatalogProduct }) {
  const { items, add, setQuantity } = useCatalogSelection();
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const selected = items.find(
    (item) => item.productId === product.id && item.variantId === variantId,
  );
  const quantity = selected?.quantity ?? 0;
  const productQuantity = items
    .filter((item) => item.productId === product.id)
    .reduce((total, item) => total + item.quantity, 0);
  const maximum = product.packLimit ?? product.maxQuantity;
  const atMaximum = maximum !== null && productQuantity >= maximum;
  const displayPrice = getDisplayPrice(product, variantId);
  const categoryName = catalogCategories.find((category) => category.id === product.category)?.shortName;

  return (
    <article className={`catalog-product-card${product.isActive ? "" : " is-inactive"}`}>
      <div className="catalog-product-image-wrap">
        <Photo
          className="catalog-product-image"
          image={product.image}
          sizes="(max-width: 600px) 48vw, (max-width: 1000px) 32vw, 22vw"
        />
        <span className="temporary-image-badge">Photo à remplacer</span>
        {product.isFeatured && <span className="catalog-featured-badge">Coup de cœur</span>}
      </div>
      <div className="catalog-product-copy">
        <span className="catalog-product-category">{categoryName}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        {product.dimensions.length > 0 && (
          <p className="catalog-product-dimensions">Dimensions : {product.dimensions.join(" · ")}</p>
        )}
        {product.colors.length > 0 && (
          <div className="catalog-colors">
            {product.colors.map((color) => <span key={color}>{color}</span>)}
          </div>
        )}
        {product.variants.length > 0 && (
          <label className="variant-select">
            <span>Choisir une variante</span>
            <select
              aria-label={`Variante de ${product.name}`}
              onChange={(event) => setVariantId(event.target.value)}
              value={variantId ?? ""}
            >
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
          </label>
        )}
        {product.packContents.length > 0 && (
          <details className="pack-details">
            <summary>Contenu du pack</summary>
            <ul>{product.packContents.map((content) => <li key={content}>{content}</li>)}</ul>
          </details>
        )}
        <div className="catalog-product-footer">
          <span className={displayPrice ? "catalog-price" : "catalog-price-unconfirmed"}>
            {displayPrice ?? (product.pricingStatus === "confirmed" ? "Tarif communiqué sur demande" : "Tarif à confirmer")}
          </span>
          {product.isActive ? (
            quantity === 0 ? (
              <button
                aria-label={`Ajouter ${product.name} à la sélection`}
                className="catalog-add-button"
                disabled={atMaximum}
                onClick={() => add(product.id, variantId)}
                type="button"
              >
                <Plus size={16} aria-hidden="true" /> {atMaximum ? "Limite atteinte" : "Choisir"}
              </button>
            ) : (
              <div aria-label={`Quantité de ${product.name}`} className="quantity-control">
                <button
                  aria-label={`Retirer une unité de ${product.name}`}
                  onClick={() => setQuantity(product.id, variantId, quantity - 1)}
                  type="button"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  aria-label={`Ajouter une unité de ${product.name}`}
                  disabled={atMaximum}
                  onClick={() => add(product.id, variantId)}
                  type="button"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            )
          ) : (
            <span className="inactive-product-label">Indisponible</span>
          )}
        </div>
        {maximum && <p className="quantity-limit">Maximum {maximum} pour cette référence.</p>}
      </div>
    </article>
  );
}

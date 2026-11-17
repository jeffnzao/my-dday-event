import { catalogCategories } from "./categories";
import type { CatalogProduct, CatalogVariant, ProductImage } from "./types";
import { productToDatabaseRow } from "./database";

const text = (value: unknown, maximum: number): value is string =>
  typeof value === "string" && value.trim().length <= maximum;

export function parseProductInput(value: unknown): ReturnType<typeof productToDatabaseRow> | null {
  if (!value || typeof value !== "object") return null;
  const product = value as Record<string, unknown>;
  if (
    typeof product.id !== "string" ||
    !/^[a-z0-9][a-z0-9-]{1,79}$/.test(product.id) ||
    !text(product.slug, 100) ||
    !/^[a-z0-9][a-z0-9-]{1,99}$/.test(product.slug) ||
    !text(product.name, 160) ||
    !product.name.trim() ||
    typeof product.category !== "string" ||
    !catalogCategories.some((category) => category.id === product.category) ||
    !text(product.description, 2000) ||
    (product.price !== null &&
      (typeof product.price !== "number" || !Number.isFinite(product.price) || product.price < 0)) ||
    !text(product.priceUnit, 120) ||
    !["to_confirm", "confirmed", "unpriced"].includes(String(product.pricingStatus)) ||
    (product.displayPrice !== null && !text(product.displayPrice, 80)) ||
    !text(product.pricingNotes, 1000) ||
    !Array.isArray(product.dimensions) ||
    !product.dimensions.every((item) => text(item, 100)) ||
    !Array.isArray(product.colors) ||
    !product.colors.every((item) => text(item, 80)) ||
    !Array.isArray(product.variants) ||
    product.variants.length > 50 ||
    !Array.isArray(product.packContents) ||
    !product.packContents.every((item) => text(item, 200)) ||
    !validLimit(product.packLimit) ||
    !validLimit(product.maxQuantity) ||
    !validImage(product.image) ||
    !Array.isArray(product.gallery) ||
    product.gallery.length > 12 ||
    !product.gallery.every(validImage) ||
    typeof product.isFeatured !== "boolean" ||
    typeof product.isActive !== "boolean" ||
    typeof product.displayOrder !== "number" ||
    !Number.isInteger(product.displayOrder) ||
    product.displayOrder < 0
  ) {
    return null;
  }
  if (!product.variants.every(validVariant)) return null;
  return productToDatabaseRow(product as CatalogProduct);
}

function validLimit(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 1000);
}

function validImage(value: unknown): value is ProductImage {
  if (!value || typeof value !== "object") return false;
  const image = value as Record<string, unknown>;
  return (
    typeof image.src === "string" &&
    image.src.length <= 500 &&
    (image.src.startsWith("/") || image.src.startsWith("https://")) &&
    typeof image.alt === "string" &&
    image.alt.length <= 250 &&
    typeof image.isPlaceholder === "boolean"
  );
}

function validVariant(value: unknown): value is CatalogVariant {
  if (!value || typeof value !== "object") return false;
  const variant = value as Record<string, unknown>;
  return (
    typeof variant.id === "string" &&
    /^[a-z0-9][a-z0-9-]{0,79}$/.test(variant.id) &&
    text(variant.name, 160) &&
    (variant.price === null ||
      (typeof variant.price === "number" && Number.isFinite(variant.price) && variant.price >= 0)) &&
    (variant.displayPrice === null || text(variant.displayPrice, 80)) &&
    (variant.dimensions === undefined || text(variant.dimensions, 100)) &&
    (variant.colors === undefined ||
      (Array.isArray(variant.colors) && variant.colors.every((item) => text(item, 80))))
  );
}

import type { CatalogProduct } from "./types";

type ProductRow = Record<string, unknown>;

export function productToDatabaseRow(product: CatalogProduct) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    price_unit: product.priceUnit,
    pricing_status: product.pricingStatus,
    display_price: product.displayPrice,
    pricing_notes: product.pricingNotes,
    dimensions: product.dimensions,
    colors: product.colors,
    variants: product.variants,
    pack_contents: product.packContents,
    pack_limit: product.packLimit,
    max_quantity: product.maxQuantity,
    image: product.image,
    gallery: product.gallery,
    availability: product.availability,
    is_featured: product.isFeatured,
    is_active: product.isActive,
    display_order: product.displayOrder,
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function productFromDatabaseRow(row: ProductRow, revealPrices: boolean): CatalogProduct | null {
  if (
    typeof row.id !== "string" ||
    typeof row.slug !== "string" ||
    typeof row.name !== "string" ||
    typeof row.category !== "string" ||
    typeof row.description !== "string" ||
    !isStringArray(row.dimensions) ||
    !isStringArray(row.colors) ||
    !isStringArray(row.pack_contents) ||
    !Array.isArray(row.variants) ||
    !Array.isArray(row.gallery) ||
    !row.image ||
    typeof row.image !== "object"
  ) {
    return null;
  }

  const variants = row.variants.filter(
    (variant): variant is CatalogProduct["variants"][number] =>
      Boolean(variant) &&
      typeof variant === "object" &&
      typeof (variant as Record<string, unknown>).id === "string" &&
      typeof (variant as Record<string, unknown>).name === "string",
  );
  const price = typeof row.price === "number" ? row.price : null;
  const pricingStatus =
    row.pricing_status === "confirmed" || row.pricing_status === "unpriced"
      ? row.pricing_status
      : "to_confirm";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    price: revealPrices ? price : null,
    priceUnit: typeof row.price_unit === "string" ? row.price_unit : "À confirmer",
    pricingStatus,
    displayPrice:
      revealPrices && typeof row.display_price === "string"
        ? row.display_price
        : null,
    pricingNotes: typeof row.pricing_notes === "string" ? row.pricing_notes : "",
    dimensions: row.dimensions,
    colors: row.colors,
    variants: variants.map((variant) => ({
      ...variant,
      price:
        revealPrices && typeof variant.price === "number"
          ? variant.price
          : null,
      displayPrice:
        revealPrices && typeof variant.displayPrice === "string"
          ? variant.displayPrice
          : null,
    })),
    packContents: row.pack_contents,
    packLimit: typeof row.pack_limit === "number" ? row.pack_limit : null,
    maxQuantity: typeof row.max_quantity === "number" ? row.max_quantity : null,
    image: row.image as CatalogProduct["image"],
    gallery: row.gallery as CatalogProduct["gallery"],
    availability: "to_confirm",
    isFeatured: row.is_featured === true,
    isActive: row.is_active === true,
    displayOrder: typeof row.display_order === "number" ? row.display_order : 0,
  };
}

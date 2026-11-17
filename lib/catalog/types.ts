export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  displayOrder: number;
};

export type CatalogVariant = {
  id: string;
  name: string;
  dimensions?: string;
  colors?: string[];
  price: number | null;
  displayPrice: string | null;
};

export type ProductImage = {
  src: string;
  alt: string;
  isPlaceholder: boolean;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  priceUnit: string;
  pricingStatus: "to_confirm" | "confirmed" | "unpriced";
  displayPrice: string | null;
  pricingNotes: string;
  dimensions: string[];
  colors: string[];
  variants: CatalogVariant[];
  packContents: string[];
  packLimit: number | null;
  maxQuantity: number | null;
  image: ProductImage;
  gallery: ProductImage[];
  availability: "to_confirm";
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
};

export type CatalogSelectionItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

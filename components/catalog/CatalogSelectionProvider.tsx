"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCatalogProduct } from "@/lib/catalog/products";
import type { CatalogSelectionItem } from "@/lib/catalog/types";
import { activeCatalogProducts } from "@/lib/catalog/products";

const STORAGE_KEY = "dday-event.catalog-selection.v1";

type CatalogSelectionContextValue = {
  items: CatalogSelectionItem[];
  products: typeof activeCatalogProducts;
  catalogError: string | null;
  storageError: string | null;
  add: (productId: string, variantId?: string | null) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clear: () => void;
};

const CatalogSelectionContext = createContext<CatalogSelectionContextValue | null>(null);

function isSelectionItem(value: unknown): value is CatalogSelectionItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    (typeof item.variantId === "string" || item.variantId === null) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 1000
  );
}

export function CatalogSelectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogSelectionItem[]>([]);
  const [products, setProducts] = useState(activeCatalogProducts);
  const [isHydrated, setIsHydrated] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Le catalogue administrable est indisponible.");
        if (!Array.isArray(result.products)) throw new Error("Le catalogue reçu est invalide.");
        if (active) {
          setProducts(result.products.filter((product: { isActive?: unknown }) => product.isActive === true));
          setCatalogError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setCatalogError(error instanceof Error ? error.message : "Le catalogue administrable est indisponible.");
        }
      })
      .finally(() => {
        if (active) setCatalogLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(isSelectionItem)) {
          throw new Error("Le format de la sélection enregistrée est invalide.");
        }
        setItems(parsed);
      }
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `La sélection enregistrée n’a pas pu être lue : ${error.message}`
          : "La sélection enregistrée n’a pas pu être lue.",
      );
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !catalogLoaded || catalogError) return;
    setItems((current) => {
      const totals = new Map<string, number>();
      const valid: CatalogSelectionItem[] = [];
      for (const item of current) {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (
          !product?.isActive ||
          (item.variantId && !product.variants.some((variant) => variant.id === item.variantId))
        ) continue;
        const maximum = Math.min(product.packLimit ?? product.maxQuantity ?? 1000, 1000);
        const used = totals.get(product.id) ?? 0;
        const quantity = Math.min(item.quantity, maximum - used);
        if (quantity > 0) {
          valid.push({ ...item, quantity });
          totals.set(product.id, used + quantity);
        }
      }
      return valid;
    });
  }, [catalogError, catalogLoaded, isHydrated, products]);

  useEffect(() => {
    if (!isHydrated || storageError) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `La sélection ne peut pas être enregistrée dans ce navigateur : ${error.message}`
          : "La sélection ne peut pas être enregistrée dans ce navigateur.",
      );
    }
  }, [isHydrated, items, storageError]);

  const setQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      const product = products.find((candidate) => candidate.id === productId) ?? getCatalogProduct(productId);
      if (!product?.isActive) return;
      const selectedVariant = variantId
        ? product.variants.find((variant) => variant.id === variantId)
        : undefined;
      if (variantId && !selectedVariant) return;

      const keyMatches = (item: CatalogSelectionItem) =>
        item.productId === productId && item.variantId === variantId;
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => !keyMatches(item)));
        return;
      }

      setItems((current) => {
        const quantityInOtherVariants = current
          .filter((item) => item.productId === productId && !keyMatches(item))
          .reduce((total, item) => total + item.quantity, 0);
        const maximum = product.packLimit ?? product.maxQuantity;
        const availableQuantity = maximum === null ? quantity : maximum - quantityInOtherVariants;
        const boundedQuantity = Math.min(quantity, availableQuantity, 1000);
        if (boundedQuantity <= 0) return current;
        if (current.some(keyMatches)) {
          return current.map((item) =>
            keyMatches(item) ? { ...item, quantity: boundedQuantity } : item,
          );
        }
        return [...current, { productId, variantId, quantity: boundedQuantity }];
      });
    },
    [products],
  );

  const add = useCallback(
    (productId: string, variantId: string | null = null) => {
      const product = products.find((candidate) => candidate.id === productId) ?? getCatalogProduct(productId);
      if (!product?.isActive || (variantId && !product.variants.some((variant) => variant.id === variantId))) {
        return;
      }
      setItems((current) => {
        const keyMatches = (item: CatalogSelectionItem) =>
          item.productId === productId && item.variantId === variantId;
        const existing = current.find(keyMatches);
        const quantityInOtherVariants = current
          .filter((item) => item.productId === productId && !keyMatches(item))
          .reduce((total, item) => total + item.quantity, 0);
        const maximum = product.packLimit ?? product.maxQuantity;
        const effectiveMaximum = Math.min(maximum ?? 1000, 1000);
        if (quantityInOtherVariants + (existing?.quantity ?? 0) >= effectiveMaximum) {
          return current;
        }
        if (existing) {
          return current.map((item) =>
            keyMatches(item) ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }
        return [...current, { productId, variantId, quantity: 1 }];
      });
    },
    [products],
  );

  const clear = useCallback(() => {
    setItems([]);
    setStorageError(null);
  }, []);
  const value = useMemo(
    () => ({ items, products, catalogError, storageError, add, setQuantity, clear }),
    [items, products, catalogError, storageError, add, setQuantity, clear],
  );

  return <CatalogSelectionContext.Provider value={value}>{children}</CatalogSelectionContext.Provider>;
}

export function useCatalogSelection(): CatalogSelectionContextValue {
  const context = useContext(CatalogSelectionContext);
  if (!context) {
    throw new Error("useCatalogSelection doit être utilisé dans CatalogSelectionProvider.");
  }
  return context;
}

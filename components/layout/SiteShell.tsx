import type { ReactNode } from "react";
import { CatalogSelectionProvider } from "@/components/catalog/CatalogSelectionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <CatalogSelectionProvider>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-3"
        href="#main-content"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </CatalogSelectionProvider>
  );
}

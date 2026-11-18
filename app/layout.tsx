import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: {
    default: "MY DDAY EVENT — Location de décoration de mariage",
    template: "%s — MY DDAY EVENT",
  },
  description: "Décoration et location pour un mariage qui vous ressemble.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}

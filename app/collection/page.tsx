import type { Metadata } from "next";
import { CollectionPage } from "@/components/catalog/CollectionPage";

export const metadata: Metadata = { title: "La collection" };

export default function Page() {
  return <CollectionPage />;
}

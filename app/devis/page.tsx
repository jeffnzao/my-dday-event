import type { Metadata } from "next";
import { QuotePage } from "@/components/forms/QuotePage";

export const metadata: Metadata = { title: "Préparer mon devis" };

export default function Page() {
  return <QuotePage />;
}

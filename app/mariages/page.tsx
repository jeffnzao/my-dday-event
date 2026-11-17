import type { Metadata } from "next";
import { WeddingsPage } from "@/components/inspiration/WeddingsPage";

export const metadata: Metadata = { title: "Nos mariages" };

export default function Page() {
  return <WeddingsPage />;
}

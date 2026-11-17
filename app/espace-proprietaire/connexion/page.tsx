import type { Metadata } from "next";
import { OwnerLogin } from "@/components/admin/OwnerLogin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Connexion propriétaire" };

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const configured = Boolean(supabase);
  return <OwnerLogin configured={configured} />;
}

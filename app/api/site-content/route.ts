import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Le contenu administrable n’est pas configuré." }, { status: 503 });
  const { data, error } = await supabase.rpc("get_public_site_content");
  if (error || !data || typeof data !== "object") {
    if (error) console.error("Public editorial content query failed:", error.message);
    return NextResponse.json({ error: "Le contenu éditorial enregistré est indisponible." }, { status: 503 });
  }
  return NextResponse.json({ homeContent: data });
}

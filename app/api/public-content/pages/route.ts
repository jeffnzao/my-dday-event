import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Contenu indisponible." }, { status: 503 });
  const { data, error } = await supabase
    .from("site_pages")
    .select("id,title,published_content,status,published_at")
    .eq("status", "published");
  if (error) return NextResponse.json({ error: "Les pages publiées n’ont pas pu être chargées." }, { status: 503 });
  return NextResponse.json({ pages: data ?? [] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

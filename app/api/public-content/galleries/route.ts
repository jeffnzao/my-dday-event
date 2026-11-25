import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Galeries indisponibles." }, { status: 503 });
  const { data, error } = await supabase
    .from("galleries")
    .select("id,slug,title,theme,description,cover_media_id,status,published_at,gallery_media(display_order,media_id)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Les galeries publiées n’ont pas pu être chargées." }, { status: 503 });
  return NextResponse.json({ galleries: data ?? [] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

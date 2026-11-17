import { NextResponse, type NextRequest } from "next/server";
import { getOwnerSession } from "@/lib/supabase/owner";

export async function GET() {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { data, error } = await adminClient
    .from("catalog_settings")
    .select("display_prices_publicly")
    .eq("singleton", true)
    .single();
  if (error) {
    console.error("Owner catalog settings query failed:", error.message);
    return NextResponse.json({ error: "Les réglages du catalogue n’ont pas pu être chargés." }, { status: 503 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Réglage invalide." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).display_prices_publicly !== "boolean") {
    return NextResponse.json({ error: "Le réglage de publication des tarifs est invalide." }, { status: 400 });
  }
  const { data, error } = await adminClient
    .from("catalog_settings")
    .update({ display_prices_publicly: (body as { display_prices_publicly: boolean }).display_prices_publicly })
    .eq("singleton", true)
    .select("display_prices_publicly")
    .single();
  if (error) {
    console.error("Owner catalog settings update failed:", error.message);
    return NextResponse.json({ error: "Le réglage de publication n’a pas pu être enregistré." }, { status: 503 });
  }
  return NextResponse.json(data);
}

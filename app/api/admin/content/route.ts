import { NextResponse, type NextRequest } from "next/server";
import { getOwnerSession } from "@/lib/supabase/owner";

function validContent(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  const limits: Record<string, number> = {
    eyebrow: 100,
    title: 160,
    titleAccent: 160,
    intro: 600,
    description: 1200,
    introductionTitle: 160,
    introductionAccent: 160,
  };
  for (const [field, maximum] of Object.entries(limits)) {
    if (typeof content[field] !== "string" || !content[field].trim() || content[field].length > maximum) return false;
  }
  return (
    Array.isArray(content.introduction) &&
    content.introduction.length === 3 &&
    content.introduction.every((paragraph) => typeof paragraph === "string" && paragraph.trim().length > 0 && paragraph.length <= 800)
  );
}

export async function GET() {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { data, error } = await adminClient
    .from("site_content")
    .select("home_content")
    .eq("singleton", true)
    .single();
  if (error) {
    console.error("Owner site content query failed:", error.message);
    return NextResponse.json({ error: "Le contenu d’accueil n’a pas pu être chargé." }, { status: 503 });
  }
  return NextResponse.json({ homeContent: data.home_content });
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
    return NextResponse.json({ error: "Le contenu d’accueil est invalide." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || !validContent((body as Record<string, unknown>).homeContent)) {
    return NextResponse.json({ error: "Un champ du contenu est manquant, trop long ou invalide." }, { status: 400 });
  }
  const { data, error } = await adminClient
    .from("site_content")
    .update({ home_content: (body as { homeContent: Record<string, unknown> }).homeContent })
    .eq("singleton", true)
    .select("home_content")
    .single();
  if (error) {
    console.error("Owner site content update failed:", error.message);
    return NextResponse.json({ error: "Le contenu d’accueil n’a pas pu être enregistré." }, { status: 503 });
  }
  return NextResponse.json({ homeContent: data.home_content });
}

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
    .from("galleries")
    .select("*, gallery_media(*, media_assets(*))")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Les galeries n’ont pas pu être chargées." }, { status: 503 });
  return NextResponse.json({ galleries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Galerie invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Galerie invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 160) : "";
  const theme = typeof input.theme === "string" ? input.theme.trim().slice(0, 80) : "";
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 2000) : "";
  if (!title || !theme) return NextResponse.json({ error: "Le titre et le thème sont obligatoires." }, { status: 400 });
  const slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
  const coverMediaId = typeof input.coverMediaId === "string" ? input.coverMediaId : null;
  const status = input.status === "published" ? "published" : input.status === "archived" ? "archived" : "draft";
  const { data: gallery, error } = await adminClient
    .from("galleries")
    .insert({ slug, title, theme, description, cover_media_id: coverMediaId, status,
      published_at: status === "published" ? new Date().toISOString() : null,
      archived_at: status === "archived" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "La galerie n’a pas pu être créée." }, { status: 409 });
  const mediaIds = Array.isArray(input.mediaIds) ? input.mediaIds.filter((id): id is string => typeof id === "string").slice(0, 500) : [];
  if (mediaIds.length) {
    const { error: linksError } = await adminClient.from("gallery_media").insert(
      mediaIds.map((mediaId, display_order) => ({ gallery_id: gallery.id, media_id: mediaId, display_order })),
    );
    if (linksError) {
      await adminClient.from("galleries").delete().eq("id", gallery.id);
      return NextResponse.json({ error: "Les médias n’ont pas pu être associés à la galerie." }, { status: 409 });
    }
  }
  await adminClient.from("cms_audit_log").insert({ action: "create", entity_type: "gallery", entity_id: gallery.id, details: { title, theme } });
  return NextResponse.json({ gallery }, { status: 201 });
}

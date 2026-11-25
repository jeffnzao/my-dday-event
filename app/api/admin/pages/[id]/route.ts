import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getOwnerSession } from "@/lib/supabase/owner";

const corePages = new Set(["accueil", "presentation", "mariages-evenements", "inspirations", "galeries", "infos"]);

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { id } = await context.params;
  const { data: source, error: sourceError } = await adminClient
    .from("site_pages")
    .select("title,draft_content,published_content")
    .eq("id", id)
    .single();
  if (sourceError || !source) return NextResponse.json({ error: "La page à dupliquer est introuvable." }, { status: 404 });
  const suffix = randomUUID().slice(0, 8);
  const duplicateId = `${id.slice(0, 84)}-copie-${suffix}`;
  const title = `${source.title} — copie`;
  const { data, error } = await adminClient
    .from("site_pages")
    .insert({
      id: duplicateId,
      title,
      draft_content: source.draft_content,
      published_content: null,
      status: "draft",
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "La page n’a pas pu être dupliquée." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({
    action: "duplicate",
    entity_type: "page",
    entity_id: duplicateId,
    details: { source_id: id, title },
  });
  return NextResponse.json({ page: data }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Action de page invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object" || (body as Record<string, unknown>).action !== "archive") {
    return NextResponse.json({ error: "Action de page invalide." }, { status: 400 });
  }
  const { data: page, error: pageError } = await adminClient
    .from("site_pages")
    .select("id,draft_content,title")
    .eq("id", id)
    .single();
  if (pageError || !page) return NextResponse.json({ error: "La page est introuvable." }, { status: 404 });
  const draftContent = page.draft_content && typeof page.draft_content === "object"
    ? { ...(page.draft_content as Record<string, unknown>), archived: true }
    : { sections: [], archived: true };
  const { data, error } = await adminClient
    .from("site_pages")
    .update({ status: "draft", draft_content: draftContent, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "La page n’a pas pu être archivée." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({
    action: "archive",
    entity_type: "page",
    entity_id: id,
    details: { title: page.title },
  });
  return NextResponse.json({ page: data });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { id } = await context.params;
  if (corePages.has(id)) return NextResponse.json({ error: "Les six pages principales sont protégées. Elles peuvent être modifiées ou archivées, mais pas supprimées." }, { status: 409 });
  const { data: page, error: pageError } = await adminClient.from("site_pages").select("id,title").eq("id", id).single();
  if (pageError || !page) return NextResponse.json({ error: "La page est introuvable." }, { status: 404 });
  const { error } = await adminClient.from("site_pages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "La page n’a pas pu être supprimée." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({
    action: "delete",
    entity_type: "page",
    entity_id: id,
    details: { title: page.title },
  });
  return NextResponse.json({ deleted: true });
}

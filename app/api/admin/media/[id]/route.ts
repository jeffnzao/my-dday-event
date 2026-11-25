import { NextResponse, type NextRequest } from "next/server";
import { getOwnerSession } from "@/lib/supabase/owner";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });

  const { id } = await context.params;
  const { data: existing, error: existingError } = await adminClient.from("media_assets").select("*").eq("id", id).single();
  if (existingError || !existing) return NextResponse.json({ error: "Ce média est introuvable." }, { status: 404 });
  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Le fichier de remplacement est invalide." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Sélectionnez le nouveau fichier." }, { status: 400 });
  if (existing.media_type === "image" && !["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(file.type)) {
    return NextResponse.json({ error: "Le remplacement doit être une image autorisée." }, { status: 415 });
  }
  if (existing.media_type === "video" && !["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
    return NextResponse.json({ error: "Le remplacement doit être une vidéo autorisée." }, { status: 415 });
  }
  const limit = existing.media_type === "image" ? Number(process.env.MDDAY_IMAGE_MAX_BYTES ?? 10 * 1024 * 1024) : Number(process.env.MDDAY_VIDEO_MAX_BYTES ?? 100 * 1024 * 1024);
  if (file.size > limit) return NextResponse.json({ error: "Le fichier dépasse la limite configurée." }, { status: 413 });

  const { error: uploadError } = await adminClient.storage.from(existing.bucket).upload(existing.object_path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) return NextResponse.json({ error: `Échec du remplacement : ${uploadError.message}` }, { status: 502 });
  const { data, error } = await adminClient.from("media_assets").update({
    mime_type: file.type,
    file_name: file.name,
    byte_size: file.size,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: "Le fichier est remplacé mais les métadonnées n’ont pas pu être enregistrées." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({ action: "replace", entity_type: "media", entity_id: id, details: { file_name: file.name } });
  return NextResponse.json({ media: data });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });

  const { id } = await context.params;
  const { data: existing, error: existingError } = await adminClient.from("media_assets").select("*").eq("id", id).single();
  if (existingError || !existing) return NextResponse.json({ error: "Ce média est introuvable." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Données du média invalides." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Données du média invalides." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  for (const [key, column] of [["title", "title"], ["description", "description"], ["altText", "alt_text"], ["category", "category"]] as const) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== "string") return NextResponse.json({ error: "Un champ texte du média est invalide." }, { status: 400 });
      update[column] = input[key].trim();
    }
  }
  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags) || !input.tags.every((tag) => typeof tag === "string")) return NextResponse.json({ error: "Les étiquettes sont invalides." }, { status: 400 });
    update.tags = input.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 20);
  }
  if (input.status !== undefined) {
    if (!["draft", "published", "archived"].includes(String(input.status))) return NextResponse.json({ error: "Statut de média invalide." }, { status: 400 });
    update.status = input.status;
    if (input.status === "published") update.published_at = new Date().toISOString();
    if (input.status === "archived") update.archived_at = new Date().toISOString();
  }
  if (!Object.keys(update).length) return NextResponse.json({ error: "Aucune modification reçue." }, { status: 400 });
  update.updated_at = new Date().toISOString();
  const { data, error } = await adminClient.from("media_assets").update(update).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: "Le média n’a pas pu être enregistré." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({ action: "update", entity_type: "media", entity_id: id, details: update });
  return NextResponse.json({ media: data });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });

  const { id } = await context.params;
  const { data: media, error: mediaError } = await adminClient.from("media_assets").select("*").eq("id", id).single();
  if (mediaError || !media) return NextResponse.json({ error: "Ce média est introuvable." }, { status: 404 });

  const [{ data: products }, { data: pages }, { data: galleryLinks }] = await Promise.all([
    adminClient.from("products").select("id,name,image,gallery"),
    adminClient.from("site_pages").select("id,draft_content,published_content"),
    adminClient.from("gallery_media").select("gallery_id").eq("media_id", id),
  ]);
  const references: string[] = [];
  const search = String(media.object_path);
  for (const product of products ?? []) {
    if (JSON.stringify(product).includes(search) || JSON.stringify(product.image).includes(media.id)) references.push(`Produit : ${product.name}`);
  }
  for (const page of pages ?? []) {
    if (JSON.stringify(page).includes(search) || JSON.stringify(page).includes(media.id)) references.push(`Page : ${page.id}`);
  }
  if (galleryLinks?.length) references.push(`${galleryLinks.length} galerie(s)`);
  if (references.length) return NextResponse.json({ error: "Suppression refusée : média utilisé.", references }, { status: 409 });

  const { error: removeError } = await adminClient.storage.from(media.bucket).remove([media.object_path]);
  if (removeError) return NextResponse.json({ error: "Le fichier n’a pas pu être supprimé du stockage." }, { status: 502 });
  const { error: deleteError } = await adminClient.from("media_assets").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Les métadonnées n’ont pas pu être supprimées." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({ action: "delete", entity_type: "media", entity_id: id, details: { file_name: media.file_name } });
  return NextResponse.json({ deleted: true });
}

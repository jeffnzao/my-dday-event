import { NextResponse, type NextRequest } from "next/server";
import { getOwnerSession } from "@/lib/supabase/owner";

const allowedPageId = /^[a-z0-9][a-z0-9-]{0,99}$/;
const allowedBlockTypes = new Set([
  "hero", "heading", "text", "image", "image_text", "photos", "videos",
  "testimonials", "services", "service_list", "faq", "button", "contact",
]);
const allowedColors = new Set(["rose", "sage", "cream", "white"]);

function validPageContent(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const content = value as Record<string, unknown>;
  if (content.sections !== undefined && !Array.isArray(content.sections)) return false;
  const sections = content.sections ?? [];
  if (!Array.isArray(sections) || sections.length > 100) return false;
  return sections.every((section) => {
    if (!section || typeof section !== "object" || Array.isArray(section)) return false;
    const block = section as Record<string, unknown>;
    if (typeof block.id !== "string" || block.id.length > 100 || typeof block.type !== "string" || !allowedBlockTypes.has(block.type)) return false;
    if (block.color !== undefined && (typeof block.color !== "string" || !allowedColors.has(block.color))) return false;
    for (const key of ["eyebrow", "title", "subtitle", "text", "imageId", "imageUrl", "buttonText", "buttonUrl"]) {
      if (block[key] !== undefined && (typeof block[key] !== "string" || (block[key] as string).length > 5000)) return false;
    }
    if (block.items !== undefined) {
      if (!Array.isArray(block.items) || block.items.length > 50) return false;
      if (!block.items.every((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        const entry = item as Record<string, unknown>;
        return typeof entry.title === "string"
          && typeof entry.text === "string"
          && entry.title.length <= 500
          && entry.text.length <= 5000;
      })) return false;
    }
    return true;
  });
}

export async function GET() {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  await adminClient.from("site_pages").upsert([
    { id: "accueil", title: "Accueil", draft_content: { sections: [] } },
    { id: "presentation", title: "Présentation de l’entreprise", draft_content: { sections: [] } },
    { id: "mariages-evenements", title: "Mariages et événements", draft_content: { sections: [] } },
    { id: "inspirations", title: "Inspirations", draft_content: { sections: [] } },
    { id: "galeries", title: "Galeries", draft_content: { sections: [] } },
    { id: "infos", title: "Informations et coordonnées", draft_content: { sections: [] } },
  ], { onConflict: "id", ignoreDuplicates: true });
  const { data, error } = await adminClient.from("site_pages").select("*").order("id");
  if (error) return NextResponse.json({ error: "Les pages n’ont pas pu être chargées." }, { status: 503 });
  return NextResponse.json({ pages: data ?? [] });
}

export async function PUT(request: NextRequest) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Contenu de page invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Contenu de page invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const id = typeof input.id === "string" ? input.id : "";
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 200) : "";
  const content = input.draftContent;
  if (!allowedPageId.test(id) || !title || !validPageContent(content)) {
    return NextResponse.json({ error: "Page ou structure de contenu invalide." }, { status: 400 });
  }
  const serialized = JSON.stringify(content);
  if (serialized.length > 100000) return NextResponse.json({ error: "Le contenu de cette page est trop volumineux." }, { status: 413 });
  const action = input.action === "publish" ? "publish" : "save";
  const update: Record<string, unknown> = {
    id,
    title,
    draft_content: content,
    updated_at: new Date().toISOString(),
  };
  if (action === "publish") {
    update.published_content = content;
    update.status = "published";
    update.published_at = new Date().toISOString();
  }
  const { data, error } = await adminClient
    .from("site_pages")
    .upsert(update, { onConflict: "id" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "La page n’a pas pu être enregistrée." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({
    action: action === "publish" ? "publish" : "save_draft",
    entity_type: "page",
    entity_id: id,
    details: { title },
  });
  return NextResponse.json({ page: data });
}

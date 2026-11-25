import { NextResponse, type NextRequest } from "next/server";
import { getOwnerSession } from "@/lib/supabase/owner";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Action produit invalide." }, { status: 400 }); }
  const action = body && typeof body === "object" ? (body as Record<string, unknown>).action : null;
  if (!["publish", "draft", "archive", "reactivate"].includes(String(action))) {
    return NextResponse.json({ error: "Action produit invalide." }, { status: 400 });
  }
  const status = action === "archive" ? "archived" : action === "draft" ? "draft" : "published";
  const update: Record<string, unknown> = {
    publication_status: status,
    is_active: status === "published",
    updated_at: new Date().toISOString(),
  };
  if (status === "archived") update.archived_at = new Date().toISOString();
  const { data, error } = await adminClient.from("products").update(update).eq("id", id).select("id,name,is_active,publication_status").single();
  if (error) return NextResponse.json({ error: "Le statut du produit n’a pas pu être enregistré." }, { status: 503 });
  await adminClient.from("cms_audit_log").insert({ action: String(action), entity_type: "product", entity_id: id, details: { status } });
  return NextResponse.json({ product: data });
}

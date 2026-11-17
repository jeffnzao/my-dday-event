import { NextResponse, type NextRequest } from "next/server";
import { getOwnerSession } from "@/lib/supabase/owner";

const statuses = new Set(["new", "reviewing", "quote_sent", "confirmed", "declined", "cancelled"]);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Identifiant de demande invalide." }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Données de modification invalides." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Données de modification invalides." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const update: { status?: string; internal_notes?: string } = {};
  if (input.status !== undefined) {
    if (typeof input.status !== "string" || !statuses.has(input.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    update.status = input.status;
  }
  if (input.internal_notes !== undefined) {
    if (typeof input.internal_notes !== "string" || input.internal_notes.length > 5000) {
      return NextResponse.json({ error: "La note interne est trop longue." }, { status: 400 });
    }
    update.internal_notes = input.internal_notes.trim();
  }
  if (!Object.keys(update).length) return NextResponse.json({ error: "Aucune modification reçue." }, { status: 400 });

  const { data, error } = await adminClient.from("requests").update(update).eq("id", id).select("id,status,internal_notes").single();
  if (error) {
    console.error("Owner request update failed:", error.message);
    return NextResponse.json({ error: "La demande n’a pas pu être mise à jour." }, { status: 503 });
  }
  return NextResponse.json({ request: data });
}

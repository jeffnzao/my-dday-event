import { NextResponse, type NextRequest } from "next/server";
import { getOwnerSession } from "@/lib/supabase/owner";

export async function GET(request: NextRequest) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });

  const status = request.nextUrl.searchParams.get("status");
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100);
  let requestQuery = adminClient
    .from("requests")
    .select("*, request_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && ["new", "reviewing", "quote_sent", "confirmed", "declined", "cancelled"].includes(status)) {
    requestQuery = requestQuery.eq("status", status);
  }
  if (query) {
    requestQuery = requestQuery.or(
      `first_name.ilike.%${query.replace(/[%_,.()]/g, "")}%,last_name.ilike.%${query.replace(/[%_,.()]/g, "")}%,email.ilike.%${query.replace(/[%_,.()]/g, "")}%`,
    );
  }
  const { data, error } = await requestQuery;
  if (error) {
    console.error("Owner request query failed:", error.message);
    return NextResponse.json({ error: "Les demandes n’ont pas pu être chargées." }, { status: 503 });
  }
  return NextResponse.json(
    { requests: data },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

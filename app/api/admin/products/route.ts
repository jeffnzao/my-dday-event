import { NextResponse, type NextRequest } from "next/server";
import { catalogProducts } from "@/lib/catalog/products";
import { productToDatabaseRow } from "@/lib/catalog/database";
import { parseProductInput } from "@/lib/catalog/admin-validation";
import { productFromDatabaseRow } from "@/lib/catalog/database";
import { getOwnerSession } from "@/lib/supabase/owner";

export async function GET() {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const { data, error } = await adminClient.from("products").select("*").order("category").order("display_order");
  if (error) {
    console.error("Owner catalog query failed:", error.message);
    return NextResponse.json({ error: "Le catalogue n’a pas pu être chargé." }, { status: 503 });
  }
  const products = data
    .map((row) => productFromDatabaseRow(row, true))
    .filter((product) => product !== null);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return NextResponse.json({ error: "Données produit invalides." }, { status: 400 });
  }
  const product = parseProductInput(value);
  if (!product) return NextResponse.json({ error: "Vérifiez les champs et les variantes du produit." }, { status: 400 });
  const create = Boolean((value as Record<string, unknown>).create);
  const { data: existing, error: existingError } = await adminClient
    .from("products")
    .select("id")
    .eq("id", product.id)
    .maybeSingle();
  if (existingError) {
    console.error("Owner product duplicate check failed:", existingError.message);
    return NextResponse.json({ error: "Le produit ne peut pas être vérifié avant l’enregistrement." }, { status: 503 });
  }
  if (create && existing) return NextResponse.json({ error: "Cet identifiant existe déjà. Choisissez un autre nom pour cette référence." }, { status: 409 });
  if (!create && !existing) return NextResponse.json({ error: "Cette référence n’existe plus. Actualisez le catalogue." }, { status: 404 });
  const query = create
    ? adminClient.from("products").insert(product)
    : adminClient.from("products").update(product).eq("id", product.id);
  const { data, error } = await query.select("*").single();
  if (error) {
    console.error("Owner product update failed:", error.message);
    return NextResponse.json({ error: "Le produit n’a pas pu être enregistré." }, { status: 503 });
  }
  return NextResponse.json({ product: data });
}

export async function PUT() {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });
  const rows = catalogProducts.map(productToDatabaseRow);
  const { error } = await adminClient.from("products").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  if (error) {
    console.error("Catalog initialization failed:", error.message);
    return NextResponse.json({ error: "Le catalogue initial ne peut pas être importé." }, { status: 503 });
  }
  return NextResponse.json({ inserted: rows.length, message: "Initialisation terminée ; les références déjà présentes ont été conservées." });
}

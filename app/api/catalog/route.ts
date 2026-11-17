import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productFromDatabaseRow } from "@/lib/catalog/database";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Le catalogue administrable n’est pas encore configuré." }, { status: 503 });
  }
  const { data, error } = await supabase.rpc("get_public_catalog");
  if (error) {
    console.error("Public catalog query failed:", error.message);
    return NextResponse.json({ error: "Le catalogue administrable est momentanément indisponible." }, { status: 503 });
  }
  if (!data?.length) {
    return NextResponse.json({ error: "Le catalogue n’a pas encore été initialisé par la propriétaire." }, { status: 503 });
  }
  const rows: unknown[] = data;
  const products = rows
    .map((row) =>
      row && typeof row === "object"
        ? productFromDatabaseRow(row as Record<string, unknown>, true)
        : null,
    )
    .filter((product) => product !== null);
  return NextResponse.json({ products });
}

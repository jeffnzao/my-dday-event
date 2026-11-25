import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Médiathèque indisponible." }, { status: 503 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Identifiant média invalide." }, { status: 400 });
  const { data: media, error } = await supabase
    .from("media_assets")
    .select("bucket,object_path,status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error || !media) return NextResponse.json({ error: "Média introuvable ou non publié." }, { status: 404 });
  const adminClient = createSupabaseServiceClient();
  if (!adminClient) return NextResponse.json({ error: "Médiathèque indisponible côté serveur." }, { status: 503 });
  const { data, error: signedError } = await adminClient.storage.from(media.bucket).createSignedUrl(media.object_path, 60);
  if (signedError || !data?.signedUrl) return NextResponse.json({ error: "Le média n’a pas pu être ouvert." }, { status: 503 });
  return NextResponse.redirect(data.signedUrl, { status: 307, headers: { "Cache-Control": "private, no-store" } });
}

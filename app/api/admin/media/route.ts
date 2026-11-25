import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getOwnerSession } from "@/lib/supabase/owner";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function GET(request: NextRequest) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });

  const status = request.nextUrl.searchParams.get("status");
  let query = adminClient
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (status && ["draft", "published", "archived"].includes(status)) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "La médiathèque n’a pas pu être chargée." }, { status: 503 });
  return NextResponse.json({ media: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, adminClient, owner, authenticated, error: permissionError } = await getOwnerSession();
  if (!supabase) return NextResponse.json({ error: "Supabase n’est pas configuré." }, { status: 503 });
  if (permissionError) return NextResponse.json({ error: permissionError }, { status: 503 });
  if (!authenticated) return NextResponse.json({ error: "Connexion propriétaire requise." }, { status: 401 });
  if (!owner) return NextResponse.json({ error: "Accès propriétaire requis." }, { status: 403 });
  if (!adminClient) return NextResponse.json({ error: "La clé serveur Supabase de gestion n’est pas configurée." }, { status: 503 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Les fichiers n’ont pas pu être lus." }, { status: 400 });
  }
  const files = form.getAll("files").filter((item): item is File => item instanceof File);
  if (!files.length) return NextResponse.json({ error: "Sélectionnez au moins un fichier." }, { status: 400 });
  if (files.length > 20) return NextResponse.json({ error: "Téléversez au maximum 20 fichiers à la fois." }, { status: 400 });

  const title = typeof form.get("title") === "string" ? String(form.get("title")).trim().slice(0, 160) : "";
  const description = typeof form.get("description") === "string" ? String(form.get("description")).trim().slice(0, 2000) : "";
  const altText = typeof form.get("altText") === "string" ? String(form.get("altText")).trim().slice(0, 250) : "";
  const category = typeof form.get("category") === "string" ? String(form.get("category")).trim().slice(0, 80) : null;
  const tags = typeof form.get("tags") === "string"
    ? String(form.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 20)
    : [];

  const imageLimit = Number(process.env.MDDAY_IMAGE_MAX_BYTES ?? 10 * 1024 * 1024);
  const videoLimit = Number(process.env.MDDAY_VIDEO_MAX_BYTES ?? 100 * 1024 * 1024);
  const created: unknown[] = [];

  for (const file of files) {
    const mediaType = imageTypes.has(file.type) ? "image" : videoTypes.has(file.type) ? "video" : null;
    if (!mediaType) return NextResponse.json({ error: `Format refusé : ${file.name}. Utilisez une image ou une vidéo autorisée.` }, { status: 415 });
    const limit = mediaType === "image" ? imageLimit : videoLimit;
    if (file.size > limit) return NextResponse.json({ error: `${file.name} dépasse la limite de ${Math.round(limit / 1024 / 1024)} Mo.` }, { status: 413 });

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || (mediaType === "image" ? "jpg" : "mp4");
    const objectPath = `${mediaType}s/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await adminClient.storage.from("my-dday-media").upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ error: `Échec du téléversement de ${file.name} : ${uploadError.message}` }, { status: 502 });
    }
    const { data, error: metadataError } = await adminClient
      .from("media_assets")
      .insert({
        bucket: "my-dday-media",
        object_path: objectPath,
        title: title || file.name.replace(/\.[^.]+$/, ""),
        description,
        alt_text: mediaType === "image" ? altText : "",
        category,
        tags,
        mime_type: file.type,
        file_name: file.name,
        byte_size: file.size,
        media_type: mediaType,
        status: "draft",
      })
      .select("*")
      .single();
    if (metadataError) {
      await adminClient.storage.from("my-dday-media").remove([objectPath]);
      return NextResponse.json({ error: `Les métadonnées de ${file.name} n’ont pas pu être enregistrées.` }, { status: 503 });
    }
    created.push(data);
  }

  await adminClient.from("cms_audit_log").insert({
    action: "create",
    entity_type: "media",
    entity_id: created.map((item) => (item as { id: string }).id).join(","),
    details: { count: created.length },
  });
  return NextResponse.json({ media: created }, { status: 201 });
}

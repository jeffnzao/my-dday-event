import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const eventTypes = new Set(["Mariage", "Anniversaire", "Baptême", "Fête privée", "Autre"]);

function isText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

async function notifyEmails(requestId: string, payload: Record<string, unknown>, itemCount: number) {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.DDAY_EVENT_OWNER_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !ownerEmail || !from) return "not_configured" as const;

  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  const confirmationNotice =
    "La disponibilité du matériel est confirmée par DDAY EVENT après réception de votre demande. L’envoi d’un devis ne constitue pas une réservation automatique.";
  const send = async (label: string, to: string, subject: string, html: string) => {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({ from, to: [to], subject, html }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) console.error(`${label} email provider returned status:`, response.status);
      return response.ok;
    } catch (error) {
      console.error(`${label} email could not be sent:`, error instanceof Error ? error.message : "Unknown email error.");
      return false;
    }
  };
  const [ownerSent, customerSent] = await Promise.all([
    send(
      "Owner notification",
      ownerEmail,
      `Nouvelle demande de devis DDAY EVENT (${requestId.slice(0, 8)})`,
      `<p>Une demande de devis a été enregistrée.</p><p>Référence : ${escapeHtml(requestId)}</p><p>Client : ${escapeHtml(String(payload.first_name))} ${escapeHtml(String(payload.last_name))}</p><p>Date de l’événement : ${escapeHtml(String(payload.event_date))}</p><p>Nombre de lignes d’articles : ${itemCount}</p><p>Consultez l’espace propriétaire pour les détails.</p>`,
    ),
    send(
      "Customer confirmation",
      String(payload.email),
      `DDAY EVENT — confirmation de votre demande ${requestId.slice(0, 8)}`,
      `<p>Bonjour ${escapeHtml(String(payload.first_name))},</p><p>Nous avons bien reçu votre demande de devis. Sa référence est ${escapeHtml(requestId)}.</p><p>${escapeHtml(confirmationNotice)}</p><p>L’envoi de cette confirmation ne vaut pas réservation. DDAY EVENT vous recontactera après étude de votre projet.</p>`,
    ),
  ]);
  if (ownerSent && customerSent) return "sent" as const;
  if (!ownerSent && !customerSent) return "failed" as const;
  return "partial" as const;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") && Number(request.headers.get("content-length")) > 64_000) {
    return NextResponse.json({ error: "La demande est trop volumineuse." }, { status: 413 });
  }
  const requestOrigin = request.headers.get("origin");
  const requestHost = request.headers.get("host");
  const requestProtocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    request.nextUrl.protocol.replace(":", "");
  let trustedOrigin: string | null = null;
  if (requestHost && ["http", "https"].includes(requestProtocol)) {
    try {
      trustedOrigin = new URL(`${requestProtocol}://${requestHost}`).origin;
    } catch {
      trustedOrigin = null;
    }
  }
  if (!requestOrigin || !trustedOrigin || requestOrigin !== trustedOrigin) {
    return NextResponse.json({ error: "Origine de requête invalide." }, { status: 403 });
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 64_000) {
      return NextResponse.json({ error: "La demande est trop volumineuse." }, { status: 413 });
    }
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Le formulaire reçu n’est pas au format attendu." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Le formulaire est invalide." }, { status: 400 });
  }
  const form = payload as Record<string, unknown>;
  if (typeof form.website === "string" && form.website.trim()) {
    return NextResponse.json({ error: "La demande n’a pas pu être acceptée." }, { status: 400 });
  }
  const email = typeof form.email === "string" ? form.email.trim().toLowerCase() : "";
  const guestCount = form.guest_count;
  const items = form.items;
  if (
    !isText(form.first_name, 1, 100) ||
    !isText(form.last_name, 1, 100) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !isText(form.phone, 5, 40) ||
    !validDate(form.event_date) ||
    !isText(form.venue, 1, 200) ||
    !isText(form.city, 1, 120) ||
    typeof guestCount !== "number" ||
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > 10000 ||
    typeof form.event_type !== "string" ||
    !eventTypes.has(form.event_type) ||
    typeof form.installation_requested !== "boolean" ||
    form.privacy_consent !== true ||
    !isText(form.comments ?? "", 0, 3000) ||
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 100
  ) {
    return NextResponse.json({ error: "Vérifiez les champs obligatoires et les articles de votre demande." }, { status: 400 });
  }

  const normalizedItems: Array<{ product_id: string; variant_id: string | null; variant_name: string | null; quantity: number }> = [];
  const selectedIds = new Set<string>();
  for (const candidate of items) {
    if (!candidate || typeof candidate !== "object") {
      return NextResponse.json({ error: "Une référence sélectionnée est invalide." }, { status: 400 });
    }
    const item = candidate as Record<string, unknown>;
    if (
      typeof item.product_id !== "string" ||
      !/^[a-z0-9][a-z0-9-]{1,79}$/.test(item.product_id) ||
      (item.variant_id !== null && typeof item.variant_id !== "string") ||
      (item.variant_name !== null && !isText(item.variant_name, 1, 160)) ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 1000
    ) {
      return NextResponse.json({ error: "Une référence sélectionnée est invalide." }, { status: 400 });
    }
    const key = `${item.product_id}:${item.variant_id ?? ""}`;
    if (selectedIds.has(key)) {
      return NextResponse.json({ error: "Une référence est répétée dans la sélection." }, { status: 400 });
    }
    selectedIds.add(key);
    normalizedItems.push({
      product_id: item.product_id,
      variant_id: typeof item.variant_id === "string" ? item.variant_id : null,
      variant_name: typeof item.variant_name === "string" ? item.variant_name : null,
      quantity: item.quantity,
    });
  }

  const supabase = await createSupabaseServerClient();
  const serviceClient = createSupabaseServiceClient();
  if (!supabase || !serviceClient) {
    return NextResponse.json({ error: "Le service sécurisé de demande de devis n’est pas configuré. Votre demande n’a pas été envoyée." }, { status: 503 });
  }

  if (new Date(`${form.event_date}T00:00:00.000Z`).getTime() < new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`).getTime()) {
    return NextResponse.json({ error: "La date de l’événement ne peut pas être passée." }, { status: 400 });
  }

  const clientIp =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const { data: allowed, error: rateError } = await serviceClient.rpc("consume_quote_rate_limit", {
    email_hash: hash(email),
    ip_hash: hash(clientIp),
  });
  if (rateError) {
    console.error("Quote rate limit check failed:", rateError.message);
    return NextResponse.json({ error: "La vérification anti-abus est indisponible. Réessayez plus tard." }, { status: 503 });
  }
  if (!allowed) {
    return NextResponse.json({ error: "Trop de demandes ont été envoyées récemment. Réessayez demain." }, { status: 429 });
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.product_id))];
  const { data: products, error: productsError } = await supabase.rpc("get_public_catalog");
  if (productsError) {
    console.error("Quote catalog validation failed:", productsError.message);
    return NextResponse.json({ error: "Les références ne peuvent pas être vérifiées actuellement." }, { status: 503 });
  }
  const publicProducts: Array<Record<string, unknown>> = products ?? [];
  const matchingProducts = publicProducts.filter((product) => productIds.includes(String(product.id)));
  if (matchingProducts.length !== productIds.length) {
    return NextResponse.json({ error: "Une référence sélectionnée n’est plus disponible." }, { status: 400 });
  }
  for (const product of matchingProducts) {
    const forProduct = normalizedItems.filter((item) => item.product_id === product.id);
    const rawLimit = product.pack_limit ?? product.max_quantity;
    const limit = typeof rawLimit === "number" ? rawLimit : null;
    const total = forProduct.reduce((sum, item) => sum + item.quantity, 0);
    if (limit !== null && limit !== undefined && total > limit) {
      return NextResponse.json({ error: "La quantité dépasse la limite autorisée pour une référence." }, { status: 400 });
    }
    const variants: unknown[] = Array.isArray(product.variants) ? product.variants : [];
    if (
      forProduct.some(
        (item) =>
          (variants.length > 0 && item.variant_id === null) ||
          (item.variant_id !== null &&
            !variants.some(
              (variant: unknown) =>
                Boolean(variant) &&
                typeof variant === "object" &&
                (variant as Record<string, unknown>).id === item.variant_id,
            )),
      )
    ) {
      return NextResponse.json({ error: "Une variante sélectionnée n’est plus disponible." }, { status: 400 });
    }
  }

  for (const item of normalizedItems) {
    const product = matchingProducts.find((candidate) => candidate.id === item.product_id);
    const variants: unknown[] = Array.isArray(product?.variants) ? product.variants : [];
    const variant = variants.find(
      (candidate: unknown) =>
        Boolean(candidate) &&
        typeof candidate === "object" &&
        (candidate as Record<string, unknown>).id === item.variant_id,
    ) as Record<string, unknown> | undefined;
    item.variant_name = typeof variant?.name === "string" ? variant.name : null;
  }

  const rpcPayload = {
    first_name: (form.first_name as string).trim(),
    last_name: (form.last_name as string).trim(),
    email,
    phone: (form.phone as string).trim(),
    event_date: form.event_date,
    venue: (form.venue as string).trim(),
    city: (form.city as string).trim(),
    guest_count: guestCount,
    event_type: form.event_type,
    installation_requested: form.installation_requested,
    privacy_consent: true,
    comments: (form.comments as string | undefined)?.trim() ?? "",
    items: normalizedItems,
  };
  const { data: requestId, error: submissionError } = await serviceClient.rpc("submit_quote", { payload: rpcPayload });
  if (submissionError || typeof requestId !== "string") {
    console.error("Quote submission failed:", submissionError?.message ?? "No request id returned.");
    return NextResponse.json({ error: "La demande n’a pas pu être enregistrée. Vérifiez la connexion puis réessayez." }, { status: 503 });
  }

  let emailNotification: "sent" | "not_configured" | "failed" | "partial";
  try {
    emailNotification = await notifyEmails(requestId, rpcPayload, normalizedItems.length);
  } catch (error) {
    console.error("Request notification could not be sent:", error instanceof Error ? error.message : "Unknown email error.");
    emailNotification = "failed";
  }
  return NextResponse.json({ requestId, emailNotification }, { status: 201 });
}

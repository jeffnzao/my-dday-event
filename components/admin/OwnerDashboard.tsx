"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, LogOut, Plus, RefreshCw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { catalogCategories } from "@/lib/catalog/categories";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog/types";
import { Photo } from "@/components/shared/Photo";
import { homeContent } from "@/lib/data";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { VisualPageEditor } from "@/components/admin/VisualPageEditor";

type RequestItem = {
  product_name: string;
  category: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number | null;
  price_unit: string | null;
};

type QuoteRequest = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_date: string;
  venue: string;
  city: string;
  guest_count: number;
  event_type: string;
  installation_requested: boolean;
  comments: string;
  status: string;
  internal_notes: string;
  request_items: RequestItem[];
};

type ProductDraft = CatalogProduct & { _new?: boolean };
type Tab = "dashboard" | "requests" | "catalog" | "media" | "pages" | "galleries" | "content";
type MediaAsset = {
  id: string;
  title: string;
  description: string;
  alt_text: string;
  category: string | null;
  tags: string[];
  mime_type: string;
  file_name: string;
  byte_size: number;
  media_type: "image" | "video";
  status: "draft" | "published" | "archived";
  created_at: string;
};
type SitePage = {
  id: string;
  title: string;
  draft_content: Record<string, unknown>;
  published_content: Record<string, unknown> | null;
  status: "draft" | "published";
};
type Gallery = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  description: string;
  cover_media_id: string | null;
  status: "draft" | "published" | "archived";
  gallery_media?: Array<{ media_id: string; display_order: number }>;
};
const statusNames: Record<string, string> = {
  new: "Nouvelle",
  reviewing: "À étudier",
  quote_sent: "Devis envoyé",
  confirmed: "Confirmée",
  declined: "Refusée",
  cancelled: "Annulée",
};

async function responseJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Une erreur est survenue.");
  return body as T;
}

export function OwnerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [requestQuery, setRequestQuery] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variantJson, setVariantJson] = useState("[]");
  const [galleryJson, setGalleryJson] = useState("[]");
  const [dimensionsText, setDimensionsText] = useState("");
  const [colorsText, setColorsText] = useState("");
  const [packContentsText, setPackContentsText] = useState("");
  const [displayPricesPublicly, setDisplayPricesPublicly] = useState(false);
  const [homeDraft, setHomeDraft] = useState(homeContent);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaStatus, setMediaStatus] = useState("all");
  const [mediaCategory, setMediaCategory] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectedGalleryMedia, setSelectedGalleryMedia] = useState<string[]>([]);
  const [galleryCoverMedia, setGalleryCoverMedia] = useState("");

  const loadRequests = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (requestQuery.trim()) params.set("q", requestQuery.trim());
    const result = await responseJson<{ requests: QuoteRequest[] }>(
      await fetch(`/api/admin/requests?${params}`, { cache: "no-store" }),
    );
    setRequests(result.requests);
  }, [requestQuery, statusFilter]);

  const loadProducts = useCallback(async () => {
    const result = await responseJson<{ products: CatalogProduct[] }>(
      await fetch("/api/admin/products", { cache: "no-store" }),
    );
    setProducts(result.products);
  }, []);

  const loadContent = useCallback(async () => {
    const result = await responseJson<{ homeContent: typeof homeContent }>(
      await fetch("/api/admin/content", { cache: "no-store" }),
    );
    setHomeDraft(result.homeContent);
  }, []);

  const loadMedia = useCallback(async () => {
    const result = await responseJson<{ media: MediaAsset[] }>(
      await fetch("/api/admin/media", { cache: "no-store" }),
    );
    setMedia(result.media);
  }, []);

  const loadPages = useCallback(async () => {
    const result = await responseJson<{ pages: SitePage[] }>(
      await fetch("/api/admin/pages", { cache: "no-store" }),
    );
    setPages(result.pages);
  }, []);

  const loadGalleries = useCallback(async () => {
    const result = await responseJson<{ galleries: Gallery[] }>(
      await fetch("/api/admin/galleries", { cache: "no-store" }),
    );
    setGalleries(result.galleries);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadRequests(), loadProducts(), loadContent(), loadMedia(), loadPages(), loadGalleries()]);
      const settings = await responseJson<{ display_prices_publicly: boolean }>(
        await fetch("/api/admin/settings", { cache: "no-store" }),
      );
      setDisplayPricesPublicly(settings.display_prices_publicly);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Les données n’ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  }, [loadContent, loadGalleries, loadMedia, loadPages, loadProducts, loadRequests]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (selectedRequest) setInternalNotes(selectedRequest.internal_notes ?? "");
  }, [selectedRequest]);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase("fr");
    return products.filter((product) =>
      !searchTerm || `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase("fr").includes(searchTerm),
    );
  }, [products, search]);

  const filteredMedia = useMemo(() => {
    const term = mediaSearch.trim().toLocaleLowerCase("fr");
    return media.filter((item) =>
      (mediaStatus === "all" || item.status === mediaStatus) &&
      (mediaCategory === "all" || item.category === mediaCategory) &&
      (!term || `${item.title} ${item.description} ${item.category ?? ""} ${item.tags.join(" ")} ${item.file_name}`.toLocaleLowerCase("fr").includes(term)),
    );
  }, [media, mediaCategory, mediaSearch, mediaStatus]);

  function startProduct(product?: CatalogProduct) {
    const fresh: ProductDraft = product
      ? { ...product }
      : {
          id: "",
          slug: "",
          name: "",
          category: catalogCategories[0].id,
          description: "",
          price: null,
          priceUnit: "Unité, type et durée à confirmer",
          pricingStatus: "to_confirm",
          displayPrice: null,
          pricingNotes: "",
          dimensions: [],
          colors: [],
          variants: [],
          packContents: [],
          packLimit: null,
          maxQuantity: null,
          image: { src: "/images/products/placeholder.svg", alt: "Image temporaire à remplacer", isPlaceholder: true },
          gallery: [],
          availability: "to_confirm",
          isFeatured: false,
          isActive: true,
          displayOrder: products.length + 1,
          _new: true,
        };
    setDraft(fresh);
    setVariantJson(JSON.stringify(fresh.variants, null, 2));
    setGalleryJson(JSON.stringify(fresh.gallery, null, 2));
    setDimensionsText(fresh.dimensions.join(", "));
    setColorsText(fresh.colors.join(", "));
    setPackContentsText(fresh.packContents.join(", "));
    setError(null);
    setMessage(null);
  }

  function setProductField<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const variants = JSON.parse(variantJson) as CatalogVariant[];
      const gallery = JSON.parse(galleryJson);
      const nameSlug = draft.name.trim().toLocaleLowerCase("fr")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const product = {
        ...draft,
        id: draft._new ? nameSlug : draft.id,
        slug: draft._new ? nameSlug : draft.slug,
        dimensions: dimensionsText.split(",").map((value) => value.trim()).filter(Boolean),
        colors: colorsText.split(",").map((value) => value.trim()).filter(Boolean),
        packContents: packContentsText.split(",").map((value) => value.trim()).filter(Boolean),
        variants,
        gallery,
      };
      const saved = await responseJson<{ product: CatalogProduct }>(
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...product, create: Boolean(draft._new) }),
        }),
      );
      setDraft(null);
      setMessage(`« ${saved.product.name} » a été enregistré.`);
      await Promise.all([loadProducts(), loadRequests()]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Le produit n’a pas pu être enregistré. Vérifiez les variantes et la galerie.");
    } finally {
      setSaving(false);
    }
  }

  async function seedCatalog() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await responseJson<{ inserted: number; message: string }>(
        await fetch("/api/admin/products", { method: "PUT" }),
      );
      setMessage(`${result.message} ${result.inserted} références de base proposées.`);
      await loadProducts();
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : "Le catalogue n’a pas pu être initialisé.");
    } finally {
      setSaving(false);
    }
  }

  async function changeProductStatus(id: string, action: "publish" | "draft" | "archive" | "reactivate") {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await responseJson(
        await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }),
      );
      setMessage(action === "archive" ? "Produit archivé." : "Statut du produit enregistré.");
      await loadProducts();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Le statut du produit n’a pas pu être enregistré.");
    } finally {
      setSaving(false);
    }
  }

  async function changePriceVisibility(display_prices_publicly: boolean) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await responseJson(
        await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_prices_publicly }),
        }),
      );
      setDisplayPricesPublicly(display_prices_publicly);
      setMessage(display_prices_publicly ? "Les prix confirmés sont maintenant publiés." : "Les tarifs publics sont masqués.");
      await loadProducts();
    } catch (settingsError) {
      setError(settingsError instanceof Error ? settingsError.message : "Le réglage des tarifs n’a pas pu être modifié.");
    } finally {
      setSaving(false);
    }
  }

  async function saveHomeContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await responseJson<{ homeContent: typeof homeContent }>(
        await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homeContent: homeDraft }),
        }),
      );
      setHomeDraft(result.homeContent);
      setMessage("Le contenu éditorial de la page d’accueil a été enregistré.");
    } catch (contentError) {
      setError(contentError instanceof Error ? contentError.message : "Le contenu d’accueil n’a pas pu être enregistré.");
    } finally {
      setSaving(false);
    }
  }

  async function saveRequest() {
    if (!selectedRequest) return;
    setSaving(true);
    setError(null);
    try {
      const result = await responseJson<{ request: QuoteRequest }>(
        await fetch(`/api/admin/requests/${selectedRequest.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: selectedRequest.status, internal_notes: internalNotes }),
        }),
      );
      setSelectedRequest({ ...selectedRequest, ...result.request, internal_notes: internalNotes });
      setMessage("Demande mise à jour.");
      await loadRequests();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "La demande n’a pas pu être modifiée.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      form.set("title", files.length === 1 ? files[0].name.replace(/\.[^.]+$/, "") : "");
      const result = await responseJson<{ media: MediaAsset[] }>(
        await fetch("/api/admin/media", { method: "POST", body: form }),
      );
      setUploadFiles([]);
      setMessage(`${result.media.length} fichier(s) ont été ajoutés à la médiathèque.`);
      await loadMedia();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Le téléversement a échoué.");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  async function updateMedia(id: string, update: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      await responseJson(await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      }));
      setMessage("Média enregistré.");
      await loadMedia();
    } catch (mediaError) {
      setError(mediaError instanceof Error ? mediaError.message : "Le média n’a pas pu être enregistré.");
    } finally {
      setSaving(false);
    }
  }

  async function replaceMedia(id: string, file: File) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      await responseJson(await fetch(`/api/admin/media/${id}`, { method: "POST", body: form }));
      setMessage("Le fichier a été remplacé.");
      await loadMedia();
    } catch (replaceError) {
      setError(replaceError instanceof Error ? replaceError.message : "Le remplacement n’a pas pu être effectué.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedia(item: MediaAsset) {
    if (!window.confirm(`Supprimer définitivement « ${item.title} » ? Cette action ne peut pas être annulée.`)) return;
    setSaving(true);
    setError(null);
    try {
      await responseJson(await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" }));
      setMessage("Le média a été supprimé.");
      await loadMedia();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "La suppression a été refusée.");
    } finally {
      setSaving(false);
    }
  }

  async function savePage(page: SitePage, action: "save" | "publish") {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await responseJson(await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: page.id, title: page.title, draftContent: page.draft_content, action }),
      }));
      setMessage(action === "publish" ? "La page a été publiée." : "Le brouillon a été enregistré.");
      await loadPages();
    } catch (pageError) {
      setError(pageError instanceof Error ? pageError.message : "La page n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  }

  async function createGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await responseJson(await fetch("/api/admin/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          theme: form.get("theme"),
          description: form.get("description"),
          status: form.get("status"),
          mediaIds: selectedGalleryMedia,
          coverMediaId: galleryCoverMedia || null,
        }),
      }));
      setMessage("La galerie a été créée.");
      event.currentTarget.reset();
      setSelectedGalleryMedia([]);
      setGalleryCoverMedia("");
      await loadGalleries();
    } catch (galleryError) {
      setError(galleryError instanceof Error ? galleryError.message : "La galerie n’a pas pu être créée.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) {
        setError("La déconnexion n’a pas pu être effectuée. Réessayez.");
        return;
      }
    }
    router.replace("/espace-proprietaire/connexion");
    router.refresh();
  }

  return (
    <section className="admin-page">
      <header className="admin-heading">
        <div><span className="eyebrow">MY DDAY EVENT · Administration</span><h1>Espace propriétaire</h1></div>
        <div className="admin-actions">
          <button className="button" disabled={loading || saving} onClick={() => void reload()} type="button"><RefreshCw size={15} aria-hidden="true" /> Actualiser</button>
          <button className="button" onClick={() => void logout()} type="button"><LogOut size={15} aria-hidden="true" /> Déconnexion</button>
        </div>
      </header>
      <div className="admin-tabs" role="tablist" aria-label="Gestion de l’espace propriétaire">
        <button aria-selected={tab === "dashboard"} onClick={() => setTab("dashboard")} role="tab" type="button">Tableau de bord</button>
        <button aria-selected={tab === "requests"} onClick={() => setTab("requests")} role="tab" type="button">Demandes de devis ({requests.length})</button>
        <button aria-selected={tab === "catalog"} onClick={() => setTab("catalog")} role="tab" type="button">Catalogue ({products.length})</button>
        <button aria-selected={tab === "media"} onClick={() => setTab("media")} role="tab" type="button">Médiathèque ({media.length})</button>
        <button aria-selected={tab === "pages"} onClick={() => setTab("pages")} role="tab" type="button">Pages</button>
        <button aria-selected={tab === "galleries"} onClick={() => setTab("galleries")} role="tab" type="button">Galeries</button>
        <button aria-selected={tab === "content"} onClick={() => setTab("content")} role="tab" type="button">Page d’accueil</button>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {error && <p className="quote-error" role="alert">{error}</p>}
      {draft && !draft._new && <div className="cms-product-actions">
        <button className="button" disabled={saving} onClick={() => void changeProductStatus(draft.id, "draft")} type="button">Dépublier</button>
        <button className="button" disabled={saving} onClick={() => void changeProductStatus(draft.id, "reactivate")} type="button">Réactiver</button>
        <button className="button" disabled={saving} onClick={() => { if (window.confirm("Archiver cette référence ? Elle restera conservée.")) void changeProductStatus(draft.id, "archive"); }} type="button">Archiver</button>
      </div>}
      {loading ? <p role="status">Chargement des données…</p> : tab === "dashboard" ? (
        <div className="cms-dashboard">
          <div className="cms-kpis">
            <button onClick={() => setTab("catalog")} type="button"><strong>{products.length}</strong><span>Produits</span></button>
            <button onClick={() => setTab("media")} type="button"><strong>{media.length}</strong><span>Médias</span></button>
            <button onClick={() => setTab("requests")} type="button"><strong>{requests.length}</strong><span>Demandes de devis</span></button>
          </div>
          <div className="cms-dashboard-grid">
            <section><span className="eyebrow">Derniers médias</span>{media.slice(0, 6).map((item) => <p key={item.id}><strong>{item.title}</strong><small>{item.status} · {item.mime_type}</small></p>)}</section>
            <section><span className="eyebrow">Dernières demandes</span>{requests.slice(0, 6).map((item) => <p key={item.id}><strong>{item.first_name} {item.last_name}</strong><small>{statusNames[item.status]} · {new Date(item.created_at).toLocaleDateString("fr-FR")}</small></p>)}</section>
            <section><span className="eyebrow">Raccourcis</span><button className="button" onClick={() => setTab("catalog")} type="button">Gérer le catalogue</button><button className="button" onClick={() => setTab("media")} type="button">Ouvrir la médiathèque</button><button className="button" onClick={() => setTab("pages")} type="button">Modifier les pages</button></section>
          </div>
        </div>
      ) : tab === "requests" ? (
        <div className="admin-layout">
          <section className="admin-list" aria-label="Demandes reçues">
            <div className="admin-filters">
              <label>Rechercher<input onChange={(event) => setRequestQuery(event.target.value)} placeholder="Nom ou e-mail" value={requestQuery} /></label>
              <label>Statut<select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                <option value="all">Tous les statuts</option>
                {Object.entries(statusNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select></label>
            </div>
            {requests.length ? requests.map((request) => (
              <button className={`admin-request-row${selectedRequest?.id === request.id ? " is-selected" : ""}`} key={request.id} onClick={() => setSelectedRequest(request)} type="button">
                <span className="eyebrow">{new Date(request.created_at).toLocaleDateString("fr-FR")} · {statusNames[request.status] ?? request.status}</span>
                <strong>{request.first_name} {request.last_name}</strong>
                <span>{request.event_date} · {request.city}</span>
              </button>
            )) : <p>Aucune demande pour ces filtres.</p>}
          </section>
          {selectedRequest ? (
            <article className="admin-detail">
              <span className="eyebrow">Demande · {selectedRequest.id}</span>
              <h2>{selectedRequest.first_name} {selectedRequest.last_name}</h2>
              <p><a href={`mailto:${selectedRequest.email}`}>{selectedRequest.email}</a><br /><a href={`tel:${selectedRequest.phone}`}>{selectedRequest.phone}</a></p>
              <h3>Événement</h3>
              <p>{selectedRequest.event_type} · {selectedRequest.event_date}<br />{selectedRequest.venue}, {selectedRequest.city}<br />{selectedRequest.guest_count} invités · Installation : {selectedRequest.installation_requested ? "souhaitée" : "non souhaitée"}</p>
              <h3>Articles demandés</h3>
              <ul className="admin-items">{selectedRequest.request_items.map((item, index) => <li key={`${item.product_name}:${index}`}>{item.product_name}{item.variant_name ? ` — ${item.variant_name}` : ""} × {item.quantity}<small>{item.unit_price === null ? "Prix à confirmer" : `${item.unit_price.toLocaleString("fr-FR")} € ${item.price_unit ?? ""}`}</small></li>)}</ul>
              {selectedRequest.comments && <><h3>Commentaires client</h3><p>{selectedRequest.comments}</p></>}
              <label>Statut<select onChange={(event) => setSelectedRequest({ ...selectedRequest, status: event.target.value })} value={selectedRequest.status}>
                {Object.entries(statusNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select></label>
              <label>Note interne<textarea maxLength={5000} onChange={(event) => setInternalNotes(event.target.value)} rows={4} value={internalNotes} /></label>
              <button className="button button-dark" disabled={saving} onClick={() => void saveRequest()} type="button"><Save size={15} aria-hidden="true" /> Enregistrer</button>
            </article>
          ) : <div className="admin-detail admin-empty"><p>Sélectionnez une demande pour consulter ses informations.</p></div>}
        </div>
      ) : tab === "catalog" ? (
        <div className="admin-catalog">
          <div className="admin-catalog-toolbar">
            <label>Rechercher<input onChange={(event) => setSearch(event.target.value)} placeholder="Nom, description…" value={search} /></label>
            <button className="button" disabled={saving} onClick={() => void seedCatalog()} type="button"><RefreshCw size={14} aria-hidden="true" /> Initialiser les références de base</button>
            <button className="button button-dark" onClick={() => startProduct()} type="button"><Plus size={15} aria-hidden="true" /> Ajouter un produit</button>
          </div>
          <label className="admin-price-setting">
            <input checked={displayPricesPublicly} disabled={saving} onChange={(event) => void changePriceVisibility(event.target.checked)} type="checkbox" />
            Publier sur le site les prix des références marquées « Confirmé » et ayant un tarif affichable.
          </label>
          <p className="admin-help">L’initialisation ajoute les références de base sans écraser celles déjà modifiées. Les tarifs de la base restent privés jusqu’à confirmation et publication explicites.</p>
          <div className="admin-product-list">
            {filteredProducts.map((product) => (
              <button className="admin-product-row" key={product.id} onClick={() => startProduct(product)} type="button">
                <Photo className="admin-product-thumbnail" image={product.image} sizes="46px" />
                <span><strong>{product.name}</strong><small>{catalogCategories.find((category) => category.id === product.category)?.shortName ?? product.category} · {product.isActive ? "Actif" : "Inactif"}</small></span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      ) : tab === "media" ? (
        <div className="cms-media">
          <div className="cms-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); void uploadMedia(Array.from(event.dataTransfer.files)); }}
          >
            <strong>Glissez-déposez vos photos ou vidéos ici</strong>
            <span>Plusieurs fichiers possibles · images jusqu’à 10 Mo · vidéos jusqu’à 100 Mo</span>
            <label className="button button-dark">Choisir des fichiers
              <input
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime"
                onChange={(event) => { setUploadFiles(Array.from(event.target.files ?? [])); void uploadMedia(Array.from(event.target.files ?? [])); }}
                type="file"
              />
            </label>
            {uploading && <p role="status">Téléversement en cours…</p>}
          </div>
          <div className="cms-media-toolbar">
            <label>Rechercher<input onChange={(event) => setMediaSearch(event.target.value)} value={mediaSearch} /></label>
            <label>Statut<select onChange={(event) => setMediaStatus(event.target.value)} value={mediaStatus}><option value="all">Tous</option><option value="draft">Brouillon</option><option value="published">Publié</option><option value="archived">Archivé</option></select></label>
            <label>Catégorie<select onChange={(event) => setMediaCategory(event.target.value)} value={mediaCategory}>
              <option value="all">Toutes les catégories</option>
              {Array.from(new Set(media.map((item) => item.category).filter((category): category is string => Boolean(category)))).sort().map((category) => <option key={category} value={category}>{category}</option>)}
            </select></label>
          </div>
          <div className="cms-media-grid">
            {filteredMedia.map((item) => (
              <article className="cms-media-card" key={item.id}>
                {item.media_type === "image" ? (
                  <img alt={item.alt_text || item.title} src={`/api/public-media/${item.id}`} />
                ) : (
                  <video controls preload="metadata"><source src={`/api/public-media/${item.id}`} type={item.mime_type} /></video>
                )}
                <div className="cms-media-fields">
                  <label>Titre<input maxLength={160} defaultValue={item.title} onBlur={(event) => void updateMedia(item.id, { title: event.target.value })} /></label>
                  <label>Description<textarea maxLength={2000} defaultValue={item.description} rows={2} onBlur={(event) => void updateMedia(item.id, { description: event.target.value })} /></label>
                  {item.media_type === "image" && <label>Texte alternatif<input maxLength={250} defaultValue={item.alt_text} onBlur={(event) => void updateMedia(item.id, { altText: event.target.value })} /></label>}
                  <label>Catégorie<input maxLength={80} defaultValue={item.category ?? ""} onBlur={(event) => void updateMedia(item.id, { category: event.target.value })} /></label>
                  <label>Étiquettes<input defaultValue={item.tags.join(", ")} onBlur={(event) => void updateMedia(item.id, { tags: event.target.value.split(",") })} /></label>
                  <p className="cms-media-meta">{item.mime_type} · {Math.max(1, Math.round(item.byte_size / 1024))} Ko · {item.status}</p>
                  <div className="cms-media-actions">
                    <button className="button" disabled={saving} onClick={() => void updateMedia(item.id, { status: item.status === "published" ? "draft" : "published" })} type="button">{item.status === "published" ? "Dépublier" : "Publier"}</button>
                    <button className="button" disabled={saving} onClick={() => void updateMedia(item.id, { status: "archived" })} type="button">Archiver</button>
                    <label className="button cms-media-replace">Remplacer
                      <input accept={item.media_type === "image" ? "image/jpeg,image/png,image/webp,image/avif,image/gif" : "video/mp4,video/webm,video/quicktime"} onChange={(event) => { const file = event.target.files?.[0]; if (file) void replaceMedia(item.id, file); event.target.value = ""; }} type="file" />
                    </label>
                    <button className="button cms-danger" disabled={saving} onClick={() => void deleteMedia(item)} type="button">Supprimer</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : tab === "pages" ? (
        <VisualPageEditor />
      ) : tab === "galleries" ? (
        <div className="cms-galleries">
          <form className="cms-gallery-form" onSubmit={createGallery}>
            <h2>Créer une galerie</h2>
            <label>Titre<input name="title" maxLength={160} required /></label>
            <label>Thème<select name="theme" required><option value="Mariages">Mariages</option><option value="Décoration de salle">Décoration de salle</option><option value="Tables">Tables</option><option value="Cérémonies">Cérémonies</option><option value="Coins photo">Coins photo</option><option value="Anniversaires">Anniversaires</option><option value="Autres événements">Autres événements</option></select></label>
            <label>Description<textarea name="description" maxLength={2000} rows={3} /></label>
            <label>État<select name="status"><option value="draft">Brouillon</option><option value="published">Publié</option></select></label>
            <label>Photos de la galerie
              <div className="cms-gallery-picker">
                {media.filter((item) => item.media_type === "image").map((item) => (
                  <label key={item.id}>
                    <input checked={selectedGalleryMedia.includes(item.id)} onChange={(event) => setSelectedGalleryMedia((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} type="checkbox" />
                    <span>{item.title}</span>
                  </label>
                ))}
              </div>
            </label>
            <label>Image de couverture<select value={galleryCoverMedia} onChange={(event) => setGalleryCoverMedia(event.target.value)}>
              <option value="">Choisir une couverture</option>
              {media.filter((item) => selectedGalleryMedia.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select></label>
            <button className="button button-dark" disabled={saving} type="submit">Créer la galerie</button>
          </form>
          <div className="cms-gallery-list">
            {galleries.map((gallery) => (
              <article key={gallery.id}>
                <span className="eyebrow">{gallery.theme} · {gallery.status}</span>
                <h3>{gallery.title}</h3>
                <p>{gallery.description}</p>
                <small>{gallery.gallery_media?.length ?? 0} médias</small>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <form className="admin-content-editor" onSubmit={saveHomeContent}>
          <span className="eyebrow">Contenu éditorial</span>
          <h2>Page d’accueil</h2>
          <p>Les champs ci-dessous pilotent l’accroche principale et l’introduction. Les textes des autres sections restent définis dans le projet.</p>
          <div className="admin-content-fields">
            <label>Surtitre<input maxLength={100} onChange={(event) => setHomeDraft({ ...homeDraft, eyebrow: event.target.value })} required value={homeDraft.eyebrow} /></label>
            <label>Titre<input maxLength={160} onChange={(event) => setHomeDraft({ ...homeDraft, title: event.target.value })} required value={homeDraft.title} /></label>
            <label>Accent du titre<input maxLength={160} onChange={(event) => setHomeDraft({ ...homeDraft, titleAccent: event.target.value })} required value={homeDraft.titleAccent} /></label>
            <label>Accroche<textarea maxLength={600} onChange={(event) => setHomeDraft({ ...homeDraft, intro: event.target.value })} required rows={3} value={homeDraft.intro} /></label>
            <label>Description<textarea maxLength={1200} onChange={(event) => setHomeDraft({ ...homeDraft, description: event.target.value })} required rows={4} value={homeDraft.description} /></label>
            <label>Titre d’introduction<input maxLength={160} onChange={(event) => setHomeDraft({ ...homeDraft, introductionTitle: event.target.value })} required value={homeDraft.introductionTitle} /></label>
            <label>Accent d’introduction<input maxLength={160} onChange={(event) => setHomeDraft({ ...homeDraft, introductionAccent: event.target.value })} required value={homeDraft.introductionAccent} /></label>
            {homeDraft.introduction.map((paragraph, index) => (
              <label className="admin-wide" key={index}>Paragraphe d’introduction {index + 1}
                <textarea maxLength={800} onChange={(event) => setHomeDraft({
                  ...homeDraft,
                  introduction: homeDraft.introduction.map((item, itemIndex) => itemIndex === index ? event.target.value : item),
                })} required rows={3} value={paragraph} />
              </label>
            ))}
          </div>
          <button className="button button-dark" disabled={saving} type="submit"><Save size={15} aria-hidden="true" /> Enregistrer le contenu</button>
        </form>
      )}

      {draft && (
        <div className="admin-modal-backdrop" role="presentation">
          <form aria-labelledby="product-editor-title" className="admin-product-editor" onSubmit={saveProduct}>
            <div className="admin-editor-heading"><div><span className="eyebrow">Gestion du catalogue</span><h2 id="product-editor-title">{draft._new ? "Ajouter une référence" : "Modifier la référence"}</h2></div><button aria-label="Fermer" className="admin-close" onClick={() => setDraft(null)} type="button">×</button></div>
            <div className="admin-editor-grid">
              <label>Nom<input maxLength={160} onChange={(event) => setProductField("name", event.target.value)} required value={draft.name} /></label>
              <label>Catégorie<select onChange={(event) => setProductField("category", event.target.value)} value={draft.category}>{catalogCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="admin-wide">Description<textarea maxLength={2000} onChange={(event) => setProductField("description", event.target.value)} rows={3} value={draft.description} /></label>
              <label>Prix interne (€)<input min="0" onChange={(event) => setProductField("price", event.target.value === "" ? null : Number(event.target.value))} step="0.01" type="number" value={draft.price ?? ""} /></label>
              <label>Unité du tarif<input maxLength={120} onChange={(event) => setProductField("priceUnit", event.target.value)} value={draft.priceUnit} /></label>
              <label>État du tarif<select onChange={(event) => setProductField("pricingStatus", event.target.value as CatalogProduct["pricingStatus"])} value={draft.pricingStatus}><option value="to_confirm">À confirmer</option><option value="confirmed">Confirmé</option><option value="unpriced">Sans tarif</option></select></label>
              <label>Tarif affichable<input maxLength={80} onChange={(event) => setProductField("displayPrice", event.target.value || null)} placeholder="ex. À partir de 20 €" value={draft.displayPrice ?? ""} /></label>
              <label className="admin-wide">Note tarifaire<input maxLength={1000} onChange={(event) => setProductField("pricingNotes", event.target.value)} value={draft.pricingNotes} /></label>
              <label>Dimensions, séparées par virgules<input onChange={(event) => setDimensionsText(event.target.value)} value={dimensionsText} /></label>
              <label>Couleurs / finitions, séparées par virgules<input onChange={(event) => setColorsText(event.target.value)} value={colorsText} /></label>
              <label>Contenu du pack, séparé par virgules<input onChange={(event) => setPackContentsText(event.target.value)} value={packContentsText} /></label>
              <label>Limite par référence<input min="1" onChange={(event) => setProductField("packLimit", event.target.value ? Number(event.target.value) : null)} type="number" value={draft.packLimit ?? ""} /></label>
              <label>Quantité maximale<input min="1" onChange={(event) => setProductField("maxQuantity", event.target.value ? Number(event.target.value) : null)} type="number" value={draft.maxQuantity ?? ""} /></label>
              <label>Adresse image (fichier local ou HTTPS)<input maxLength={500} onChange={(event) => setProductField("image", { ...draft.image, src: event.target.value, isPlaceholder: event.target.value.includes("placeholder") })} required value={draft.image.src} /></label>
              <label>Texte alternatif image<input maxLength={250} onChange={(event) => setProductField("image", { ...draft.image, alt: event.target.value })} value={draft.image.alt} /></label>
              <label className="admin-wide">Variantes (JSON)<textarea onChange={(event) => setVariantJson(event.target.value)} rows={6} value={variantJson} /></label>
              <label className="admin-wide">Galerie d’images (JSON)<textarea onChange={(event) => setGalleryJson(event.target.value)} rows={4} value={galleryJson} /></label>
              <label className="admin-check"><input checked={draft.isActive} onChange={(event) => setProductField("isActive", event.target.checked)} type="checkbox" /> Référence active</label>
              <label className="admin-check"><input checked={draft.isFeatured} onChange={(event) => setProductField("isFeatured", event.target.checked)} type="checkbox" /> Mettre en avant</label>
            </div>
            {error && <p className="quote-error" role="alert">{error}</p>}
            <div className="admin-editor-actions"><button className="button" onClick={() => setDraft(null)} type="button">Annuler</button><button className="button button-dark" disabled={saving} type="submit"><Save size={15} aria-hidden="true" /> {saving ? "Enregistrement…" : "Enregistrer"}</button></div>
          </form>
        </div>
      )}
      <p className="admin-footer-note"><Link className="text-link" href="/">Voir le site public <ArrowRight size={14} aria-hidden="true" /></Link></p>
    </section>
  );
}

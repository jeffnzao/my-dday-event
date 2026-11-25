"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Archive, Copy, Eye, GripVertical, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";

type Block = {
  id: string;
  type: "hero" | "heading" | "text" | "image" | "image_text" | "photos" | "videos" | "testimonials" | "services" | "service_list" | "faq" | "button" | "contact";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  imageId?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  color?: "rose" | "sage" | "cream" | "white";
  items?: Array<{ title: string; text: string }>;
};

type PageRow = {
  id: string;
  title: string;
  draft_content: Record<string, unknown>;
  published_content: Record<string, unknown> | null;
  status: "draft" | "published";
  updated_at?: string;
};

type MediaAsset = {
  id: string;
  title: string;
  alt_text: string;
  media_type: "image" | "video";
  status: "draft" | "published" | "archived";
};

const blockNames: Record<Block["type"], string> = {
  hero: "Bannière principale",
  heading: "Titre et sous-titre",
  text: "Texte simple",
  image: "Image",
  image_text: "Image avec texte",
  photos: "Galerie photos",
  videos: "Galerie vidéos",
  testimonials: "Témoignages",
  services: "Présentation des prestations",
  service_list: "Liste de services",
  faq: "Questions fréquentes",
  button: "Bouton d'action",
  contact: "Bandeau de contact",
};

async function responseJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Une erreur est survenue.");
  return body as T;
}

function getBlocks(page: PageRow): Block[] {
  const raw = page.draft_content?.sections;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is Block =>
    Boolean(item) && typeof item === "object" && typeof (item as Block).id === "string" &&
    typeof (item as Block).type === "string",
  );
}

export function VisualPageEditor() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [editor, setEditor] = useState<PageRow | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [pageResult, mediaResult] = await Promise.all([
        responseJson<{ pages: PageRow[] }>(await fetch("/api/admin/pages", { cache: "no-store" })),
        responseJson<{ media: MediaAsset[] }>(await fetch("/api/admin/media", { cache: "no-store" })),
      ]);
      setPages(pageResult.pages);
      setMedia(mediaResult.media);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Les pages n’ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    function protect(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);

  function openEditor(page: PageRow, previewFirst = false) {
    setEditor({ ...page });
    setBlocks(getBlocks(page));
    setDirty(false);
    setError(null);
    setMessage(null);
    setPreview(previewFirst);
  }

  function makeBlock(type: Block["type"]): Block {
    const id = crypto.randomUUID();
    const common = { id, type, color: "cream" as const };
    if (type === "hero") return { ...common, eyebrow: "Votre jour", title: "Un décor à votre image", subtitle: "Présentation courte", buttonText: "Découvrir", buttonUrl: "/collection" };
    if (type === "heading") return { ...common, title: "Votre titre", subtitle: "Votre sous-titre" };
    if (type === "text") return { ...common, text: "Saisissez ici votre texte." };
    if (type === "image") return { ...common, title: "Votre image" };
    if (type === "image_text") return { ...common, title: "Une section avec image", text: "Présentez votre prestation.", buttonText: "En savoir plus", buttonUrl: "/comment-louer" };
    if (type === "photos") return { ...common, title: "Notre galerie", items: [] };
    if (type === "videos") return { ...common, title: "Nos vidéos", items: [] };
    if (type === "testimonials") return { ...common, title: "Ils nous font confiance", items: [{ title: "Prénom", text: "Votre témoignage." }] };
    if (type === "services") return { ...common, title: "Nos prestations", items: [{ title: "Prestation", text: "Description de la prestation." }] };
    if (type === "service_list") return { ...common, title: "Les prestations incluses", items: [{ title: "Service", text: "Détail du service." }] };
    if (type === "faq") return { ...common, title: "Questions fréquentes", items: [{ title: "Votre question ?", text: "Votre réponse." }] };
    if (type === "button") return { ...common, title: "Prêts à imaginer votre décoration ?", buttonText: "Demander un devis", buttonUrl: "/devis" };
    return { ...common, title: "Une question ?", text: "Contactez-nous pour préparer votre événement.", buttonText: "Nous contacter", buttonUrl: "/devis" };
  }

  function addBlock(type: Block["type"]) {
    setBlocks((current) => [...current, makeBlock(type)]);
    setDirty(true);
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...patch } : block));
    setDirty(true);
  }

  function moveBlock(from: number, to: number) {
    if (from === to) return;
    setBlocks((current) => {
      const copy = [...current];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setDirty(true);
  }

  async function save(action: "save" | "publish") {
    if (!editor) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await responseJson<{ page: PageRow }>(await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editor.id,
          title: editor.title,
          draftContent: { sections: blocks },
          action,
        }),
      }));
      setEditor(result.page);
      setDirty(false);
      setMessage(action === "publish" ? "La page est publiée." : "Le brouillon est enregistré.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "La page n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  }

  async function duplicate(page: PageRow) {
    if (!window.confirm(`Dupliquer « ${page.title} » ?`)) return;
    setSaving(true);
    setError(null);
    try {
      const result = await responseJson<{ page: PageRow }>(await fetch(`/api/admin/pages/${page.id}`, {
        method: "POST",
      }));
      setMessage(`« ${result.page.title} » a été dupliquée en brouillon.`);
      await load();
    } catch (duplicateError) {
      setError(duplicateError instanceof Error ? duplicateError.message : "La page n’a pas pu être dupliquée.");
    } finally {
      setSaving(false);
    }
  }

  async function archive(page: PageRow) {
    if (!window.confirm(`Archiver « ${page.title} » ? La page ne sera plus publiée.`)) return;
    setSaving(true);
    setError(null);
    try {
      await responseJson(await fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      }));
      setMessage("La page a été archivée.");
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "La page n’a pas pu être archivée.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(page: PageRow) {
    if (!window.confirm(`Supprimer définitivement « ${page.title} » ? Cette action est irréversible.`)) return;
    setSaving(true);
    setError(null);
    try {
      await responseJson(await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" }));
      setMessage("La page a été supprimée.");
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "La page n’a pas pu être supprimée.");
    } finally {
      setSaving(false);
    }
  }

  const images = useMemo(() => media.filter((item) => item.media_type === "image"), [media]);

  if (editor) {
    return (
      <div className="cms-visual-editor">
        <header className="cms-editor-header">
          <div>
            <button className="cms-back" onClick={() => { if (!dirty || window.confirm("Quitter sans enregistrer ?")) setEditor(null); }} type="button">← Toutes les pages</button>
            <label>Titre de la page<input maxLength={200} value={editor.title} onChange={(event) => { setEditor({ ...editor, title: event.target.value }); setDirty(true); }} /></label>
          </div>
          <div className="cms-editor-actions">
            <span className={dirty ? "cms-dirty" : "cms-saved"}>{dirty ? "Modifications non enregistrées" : "Enregistré"}</span>
            <button className="button" disabled={saving} onClick={() => setPreview(true)} type="button"><Eye size={14} /> Prévisualiser</button>
            <button className="button" disabled={saving} onClick={() => void save("save")} type="button"><Save size={14} /> Enregistrer</button>
            <button className="button button-dark" disabled={saving} onClick={() => void save("publish")} type="button">Publier</button>
          </div>
        </header>
        {message && <p className="admin-message" role="status">{message}</p>}
        {error && <p className="quote-error" role="alert">{error}</p>}
        <div className="cms-editor-layout">
          <aside className="cms-block-library">
            <span className="eyebrow">Ajouter une section</span>
            {Object.entries(blockNames).map(([type, name]) => (
              <button key={type} onClick={() => addBlock(type as Block["type"])} type="button"><Plus size={13} /> {name}</button>
            ))}
          </aside>
          <main className="cms-block-canvas">
            {blocks.length === 0 && <div className="cms-empty"><p>Votre page est vide. Choisissez une section à gauche pour commencer.</p></div>}
            {blocks.map((block, index) => (
              <article
                className={`cms-block-card cms-block-${block.color ?? "cream"}`}
                draggable
                key={block.id}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => { if (dragIndex !== null) moveBlock(dragIndex, index); setDragIndex(null); }}
              >
                <div className="cms-block-heading">
                  <span><GripVertical size={15} /> {blockNames[block.type]}</span>
                  <button aria-label="Supprimer la section" onClick={() => { if (window.confirm("Supprimer cette section ?")) { setBlocks((current) => current.filter((item) => item.id !== block.id)); setDirty(true); } }} type="button"><Trash2 size={15} /></button>
                </div>
                {["hero", "heading", "image_text", "photos", "videos", "testimonials", "services", "service_list", "faq", "button", "contact"].includes(block.type) && (
                  <label>Surtitre / introduction<input value={block.eyebrow ?? ""} onChange={(event) => updateBlock(block.id, { eyebrow: event.target.value })} /></label>
                )}
                {["hero", "heading", "image", "image_text", "photos", "videos", "testimonials", "services", "service_list", "faq", "button", "contact"].includes(block.type) && (
                  <label>Titre<input value={block.title ?? ""} onChange={(event) => updateBlock(block.id, { title: event.target.value })} /></label>
                )}
                {["hero", "heading"].includes(block.type) && (
                  <label>Sous-titre<input value={block.subtitle ?? ""} onChange={(event) => updateBlock(block.id, { subtitle: event.target.value })} /></label>
                )}
                {["hero", "text", "image_text", "contact"].includes(block.type) && (
                  <label>Texte<textarea rows={4} value={block.text ?? ""} onChange={(event) => updateBlock(block.id, { text: event.target.value })} /></label>
                )}
                {["hero", "image_text", "button", "contact"].includes(block.type) && (
                  <>
                    <label>Texte du bouton<input value={block.buttonText ?? ""} onChange={(event) => updateBlock(block.id, { buttonText: event.target.value })} /></label>
                    <label>Lien du bouton<select value={block.buttonUrl ?? "/"} onChange={(event) => updateBlock(block.id, { buttonUrl: event.target.value })}>
                      <option value="/">Accueil</option><option value="/collection">Catalogue</option><option value="/devis">Demande de devis</option><option value="/comment-louer">Comment louer</option><option value="/mariages">Mariages</option>
                    </select></label>
                  </>
                )}
                {["hero", "image", "image_text", "photos"].includes(block.type) && (
                  <label>Image dans la médiathèque<select value={block.imageId ?? ""} onChange={(event) => {
                    const image = images.find((item) => item.id === event.target.value);
                    updateBlock(block.id, { imageId: event.target.value, imageUrl: `/api/public-media/${event.target.value}` });
                  }}>
                    <option value="">Aucune image</option>
                    {images.map((image) => <option key={image.id} value={image.id}>{image.title}</option>)}
                  </select></label>
                )}
                {["testimonials", "services", "service_list", "faq"].includes(block.type) && (
                  <div className="cms-repeater">
                    {(block.items ?? []).map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <label>Nom / titre<input value={item.title} onChange={(event) => updateBlock(block.id, { items: (block.items ?? []).map((entry, index) => index === itemIndex ? { ...entry, title: event.target.value } : entry) })} /></label>
                        <label>Description<textarea rows={3} value={item.text} onChange={(event) => updateBlock(block.id, { items: (block.items ?? []).map((entry, index) => index === itemIndex ? { ...entry, text: event.target.value } : entry) })} /></label>
                        <button className="cms-remove-item" onClick={() => updateBlock(block.id, { items: (block.items ?? []).filter((_, index) => index !== itemIndex) })} type="button">Retirer</button>
                      </div>
                    ))}
                    <button className="button" onClick={() => updateBlock(block.id, { items: [...(block.items ?? []), { title: "Nouvel élément", text: "Description." }] })} type="button"><Plus size={13} /> Ajouter un élément</button>
                  </div>
                )}
                <label>Couleur autorisée<select value={block.color ?? "cream"} onChange={(event) => updateBlock(block.id, { color: event.target.value as Block["color"] })}>
                  <option value="cream">Crème</option><option value="white">Blanc</option><option value="sage">Sauge</option><option value="rose">Rose</option>
                </select></label>
              </article>
            ))}
          </main>
        </div>
        {preview && (
          <div className="cms-preview-backdrop" role="dialog" aria-modal="true" aria-label="Prévisualisation">
            <div className="cms-preview-shell">
              <header><strong>Prévisualisation · {editor.title}</strong><button onClick={() => setPreview(false)} type="button">×</button></header>
              <div className="cms-preview-device">
                {blocks.map((block) => (
                  <section className={`cms-preview-block cms-preview-${block.color}`} key={block.id}>
                    {block.eyebrow && <small>{block.eyebrow}</small>}
                    {block.title && <h2>{block.title}</h2>}
                    {block.subtitle && <p>{block.subtitle}</p>}
                    {block.text && <p>{block.text}</p>}
                    {block.imageUrl && <img alt="" src={block.imageUrl} />}
                    {block.buttonText && <button type="button">{block.buttonText}</button>}
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cms-pages-manager">
      {message && <p className="admin-message" role="status">{message}</p>}
      {error && <p className="quote-error" role="alert">{error}</p>}
      {loading ? <p role="status">Chargement des pages…</p> : (
        <>
          <div className="cms-pages-toolbar">
            <div><span className="eyebrow">Gestion du contenu</span><h2>Pages du site</h2></div>
            <button className="button button-dark" disabled={saving} onClick={async () => {
              const title = window.prompt("Nom de la nouvelle page ?");
              if (!title?.trim()) return;
              setSaving(true);
              setError(null);
              try {
                await responseJson(await fetch("/api/admin/pages", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: title.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100), title: title.trim(), draftContent: { sections: [] }, action: "save" }),
                }));
                setMessage("La nouvelle page a été créée.");
                await load();
              } catch (createError) {
                setError(createError instanceof Error ? createError.message : "La page n’a pas pu être créée.");
              } finally {
                setSaving(false);
              }
            }} type="button"><Plus size={14} /> Nouvelle page</button>
          </div>
          <div className="cms-page-table">
            <div className="cms-page-table-head"><span>Page</span><span>Statut</span><span>Modification</span><span>Actions</span></div>
            {pages.map((page) => (
              <article key={page.id}>
                <div><strong>{page.title}</strong><small>{page.id}</small></div>
                <span className={`cms-status cms-status-${page.status}`}>{page.status === "published" ? "Publié" : "Brouillon"}</span>
                <time>{page.updated_at ? new Date(page.updated_at).toLocaleDateString("fr-FR") : "—"}</time>
                <div className="cms-page-actions">
                  <button onClick={() => openEditor(page)} type="button" title="Modifier"><Pencil size={14} /> Modifier</button>
                  <button onClick={() => openEditor(page, true)} type="button" title="Prévisualiser"><Eye size={14} /> Prévisualiser</button>
                  <button disabled={saving} onClick={() => void duplicate(page)} type="button" title="Dupliquer"><Copy size={14} /> Dupliquer</button>
                  <button disabled={saving} onClick={() => void archive(page)} type="button" title="Archiver"><Archive size={14} /> Archiver</button>
                  <button className="cms-danger" disabled={saving} onClick={() => void remove(page)} type="button" title="Supprimer"><Trash2 size={14} /> Supprimer</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

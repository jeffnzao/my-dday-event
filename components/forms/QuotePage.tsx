"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Trash2 } from "lucide-react";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { useCatalogSelection } from "@/components/catalog/CatalogSelectionProvider";
import { catalogCategories } from "@/lib/catalog/categories";
import type { CatalogProduct } from "@/lib/catalog/types";

type QuoteFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventDate: string;
  venue: string;
  city: string;
  guestCount: string;
  eventType: string;
  installationRequested: boolean;
  comments: string;
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm: QuoteFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  eventDate: "",
  venue: "",
  city: "",
  guestCount: "",
  eventType: "",
  installationRequested: false,
  comments: "",
};

type SubmissionResult = {
  requestId: string;
  emailNotification: "sent" | "not_configured" | "failed" | "partial";
};

function priceFor(product: CatalogProduct, variantId: string | null) {
  if (product.pricingStatus !== "confirmed") return null;
  if (!variantId) return product.price;
  return product.variants.find((item) => item.id === variantId)?.price ?? null;
}

function formattedPrice(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export function QuotePage() {
  const { items, products, storageError, setQuantity, clear } = useCatalogSelection();
  const [values, setValues] = useState<QuoteFormValues>(emptyForm);
  const [step, setStep] = useState(0);
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const selectedCount = items.reduce((total, item) => total + item.quantity, 0);

  const total = useMemo(() => {
    if (!items.length) return null;
    let value = 0;
    for (const item of items) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return null;
      if (product.pricingStatus !== "confirmed") return null;
      const unitPrice = priceFor(product, item.variantId);
      if (unitPrice === null) return null;
      value += unitPrice * item.quantity;
    }
    return value;
  }, [items, products]);

  function update<K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function continueTo(nextStep: number) {
    setError(null);
    if (nextStep > step && step === 0 && !items.length) {
      setError("Ajoutez au moins une référence avant de continuer.");
      return;
    }
    if (nextStep > step && step === 1 && !formRef.current?.reportValidity()) return;
    setStep(nextStep);
    document.getElementById("quote-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !items.length) return;
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const website = String(formData.get("website") ?? "");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          event_date: values.eventDate,
          venue: values.venue,
          city: values.city,
          guest_count: Number(values.guestCount),
          event_type: values.eventType,
          installation_requested: values.installationRequested,
          privacy_consent: true,
          comments: values.comments,
          website,
          items: items.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);
            return {
              product_id: item.productId,
              variant_id: item.variantId,
              variant_name: product?.variants.find((variant) => variant.id === item.variantId)?.name ?? null,
              quantity: item.quantity,
            };
          }),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Votre demande n’a pas pu être envoyée.");
      setSubmission(result as SubmissionResult);
      clear();
      setValues(emptyForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Votre demande n’a pas pu être envoyée. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submission) {
    return (
      <section className="quote-success" aria-labelledby="quote-success-title">
        <div className="owner-icon"><Check size={23} aria-hidden="true" /></div>
        <span className="eyebrow">Votre demande a bien été transmise</span>
        <h1 id="quote-success-title">Merci, nous avons reçu votre projet.</h1>
        <p>Référence de demande : <strong>{submission.requestId}</strong></p>
        <p>
          {submission.emailNotification === "sent"
            ? "Une confirmation a été adressée à votre e-mail et une notification transmise à MY DDAY EVENT. Nous reviendrons vers vous après étude."
            : submission.emailNotification === "not_configured"
              ? "Votre demande est enregistrée. La notification e-mail de la propriétaire n’est pas encore configurée."
              : submission.emailNotification === "partial"
                ? "Votre demande est enregistrée. Une seule des notifications e-mail a été délivrée ; MY DDAY EVENT devra vérifier l’espace propriétaire."
                : "Votre demande est enregistrée. Les notifications e-mail n’ont pas pu être envoyées ; MY DDAY EVENT devra consulter l’espace propriétaire."}
        </p>
        <p className="quote-availability-notice">
          La disponibilité du matériel est confirmée par MY DDAY EVENT après réception de votre demande. L’envoi d’un devis ne constitue pas une réservation automatique.
        </p>
        <Link className="button button-dark" href="/">Retour à l’accueil <ArrowRight size={15} aria-hidden="true" /></Link>
      </section>
    );
  }

  return (
    <div className="quote-page">
      <section className="quote-heading" id="quote-heading">
        <span className="eyebrow">Votre projet, tout en douceur</span>
        <h1>Préparer mon devis</h1>
        <p>Composez votre décoration, espace par espace.</p>
        <ol className="quote-progress" aria-label="Étapes de préparation du devis">
          {["Ma sélection", "Mon événement", "Récapitulatif"].map((label, index) => (
            <li className={index === step ? "is-current" : index < step ? "is-complete" : ""} key={label}>
              <span>{index < step ? <Check size={13} aria-hidden="true" /> : index + 1}</span> {label}
            </li>
          ))}
        </ol>
      </section>

      <form className="quote-form" onSubmit={submit} ref={formRef}>
        <input aria-hidden="true" autoComplete="off" className="quote-honeypot" name="website" tabIndex={-1} />
        {error && <p className="quote-error" role="alert">{error}</p>}
        {storageError && <p className="quote-error" role="status">{storageError}</p>}

        {step === 0 && (
          <div className="quote-layout">
            <section className="quote-catalog" aria-labelledby="quote-catalog-title">
              <div className="quote-toolbar">
                <div>
                  <span className="eyebrow">{catalogCategories.length} univers à découvrir</span>
                  <h2 id="quote-catalog-title">La collection</h2>
                </div>
                <p>Ajoutez vos idées à la sélection. Les tarifs et disponibilités seront confirmés avec MY DDAY EVENT.</p>
              </div>
              <label className="quote-date-field">
                Date de l’événement
                <input
                  min={today}
                  onChange={(event) => update("eventDate", event.target.value)}
                  required
                  type="date"
                  value={values.eventDate}
                />
              </label>
              <CatalogBrowser />
            </section>
            <aside className="quote-summary" aria-label="Récapitulatif de la sélection">
              <span className="eyebrow">Votre projet</span>
              <h2>Votre sélection <span>({selectedCount})</span></h2>
              {items.length > 0 ? (
                <>
                  <ul className="selection-list">
                    {items.map((item) => {
                      const product = products.find((candidate) => candidate.id === item.productId);
                      if (!product) return null;
                      const variant = product.variants.find((option) => option.id === item.variantId);
                      return (
                        <li key={`${item.productId}:${item.variantId ?? ""}`}>
                          <div>
                            <strong>{product.name}</strong>
                            {variant && <span>{variant.name}</span>}
                            <small>{product.pricingStatus === "confirmed"
                              ? priceFor(product, item.variantId) === null ? "Tarif communiqué sur demande" : `${formattedPrice(priceFor(product, item.variantId)!)} × ${item.quantity}`
                              : "Tarif à confirmer"}</small>
                          </div>
                          <div className="quantity-control">
                            <button aria-label={`Retirer une unité de ${product.name}`} onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)} type="button">−</button>
                            <span aria-live="polite">{item.quantity}</span>
                            <button
                              aria-label={`Ajouter une unité de ${product.name}`}
                              disabled={
                                (product.packLimit !== null || product.maxQuantity !== null) &&
                                items.filter((other) => other.productId === product.id).reduce((sum, other) => sum + other.quantity, 0) >=
                                  (product.packLimit ?? product.maxQuantity ?? Number.MAX_SAFE_INTEGER)
                              }
                              onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                              type="button"
                            >+</button>
                            <button aria-label={`Supprimer ${product.name} de la sélection`} onClick={() => setQuantity(item.productId, item.variantId, 0)} type="button">×</button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    className="selection-clear"
                    onClick={() => {
                      if (window.confirm("Vider toute votre sélection ?")) clear();
                    }}
                    type="button"
                  >
                    <Trash2 size={14} aria-hidden="true" /> Vider ma sélection
                  </button>
                </>
              ) : (
                <div className="summary-empty"><p>Choisissez des références dans le catalogue. Votre sélection apparaîtra ici.</p></div>
              )}
              <div className="summary-total">
                <span>Estimation</span>
                <strong>{total === null
                  ? items.some((item) => products.find((product) => product.id === item.productId)?.pricingStatus === "confirmed")
                    ? "Total non publié ou à confirmer"
                    : "À confirmer"
                  : formattedPrice(total)}</strong>
              </div>
              <p className="summary-privacy"><Check size={14} aria-hidden="true" /> Votre sélection est conservée dans ce navigateur.</p>
            </aside>
          </div>
        )}

        {step === 1 && (
          <section className="quote-step-panel" aria-labelledby="quote-event-title">
            <span className="eyebrow">Étape 2 · Votre événement</span>
            <h2 id="quote-event-title">Parlez-nous de votre journée.</h2>
            <div className="quote-fields">
              <label>Prénom<input autoComplete="given-name" maxLength={100} onChange={(event) => update("firstName", event.target.value)} required value={values.firstName} /></label>
              <label>Nom<input autoComplete="family-name" maxLength={100} onChange={(event) => update("lastName", event.target.value)} required value={values.lastName} /></label>
              <label>E-mail<input autoComplete="email" maxLength={254} onChange={(event) => update("email", event.target.value)} required type="email" value={values.email} /></label>
              <label>Téléphone<input autoComplete="tel" maxLength={40} onChange={(event) => update("phone", event.target.value)} required type="tel" value={values.phone} /></label>
              <label>Date de l’événement<input min={today} onChange={(event) => update("eventDate", event.target.value)} required type="date" value={values.eventDate} /></label>
              <label>Type d’événement
                <select onChange={(event) => update("eventType", event.target.value)} required value={values.eventType}>
                  <option value="">Choisir…</option><option>Mariage</option><option>Anniversaire</option><option>Baptême</option><option>Fête privée</option><option>Autre</option>
                </select>
              </label>
              <label>Lieu de réception<input autoComplete="organization" maxLength={200} onChange={(event) => update("venue", event.target.value)} required value={values.venue} /></label>
              <label>Ville<input autoComplete="address-level2" maxLength={120} onChange={(event) => update("city", event.target.value)} required value={values.city} /></label>
              <label>Nombre d’invités<input min="1" max="10000" onChange={(event) => update("guestCount", event.target.value)} required type="number" value={values.guestCount} /></label>
              <label className="quote-checkbox"><input checked={values.installationRequested} onChange={(event) => update("installationRequested", event.target.checked)} type="checkbox" /> Je souhaite être contacté(e) pour une installation</label>
              <label className="quote-comments">Commentaires complémentaires<textarea maxLength={3000} onChange={(event) => update("comments", event.target.value)} rows={5} value={values.comments} /></label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="quote-step-panel quote-review" aria-labelledby="quote-review-title">
            <span className="eyebrow">Étape 3 · Vérification</span>
            <h2 id="quote-review-title">Votre demande de devis</h2>
            <div className="review-grid">
              <div><h3>Vos coordonnées</h3><p>{values.firstName} {values.lastName}<br />{values.email}<br />{values.phone}</p></div>
              <div><h3>Votre événement</h3><p>{values.eventType} · {values.eventDate}<br />{values.venue}<br />{values.city} · {values.guestCount} invités<br />Installation souhaitée : {values.installationRequested ? "Oui" : "Non"}</p></div>
            </div>
            {values.comments && <div><h3>Commentaires</h3><p>{values.comments}</p></div>}
            <h3>Articles sélectionnés</h3>
            <ul className="review-items">
              {items.map((item) => {
                const product = products.find((candidate) => candidate.id === item.productId);
                if (!product) return null;
                const variant = product.variants.find((option) => option.id === item.variantId);
                const unitPrice = priceFor(product, item.variantId);
                return <li key={`${item.productId}:${item.variantId ?? ""}`}>
                  <span>
                    {product.name}{variant ? ` — ${variant.name}` : ""} · {item.quantity}
                    <small>{unitPrice === null
                      ? product.pricingStatus === "confirmed" ? "Prix non publié" : "Prix unitaire à confirmer"
                      : `${formattedPrice(unitPrice)} × ${item.quantity}`}</small>
                  </span>
                  <strong>{unitPrice === null
                    ? product.pricingStatus === "confirmed" ? "Sous-total non publié" : "Sous-total à confirmer"
                    : formattedPrice(unitPrice * item.quantity)}</strong>
                </li>;
              })}
            </ul>
            <p className="summary-total"><span>Total estimatif</span><strong>{total === null
              ? items.some((item) => products.find((product) => product.id === item.productId)?.pricingStatus === "confirmed")
                ? "Total non publié ou à confirmer"
                : "À confirmer"
              : formattedPrice(total)}</strong></p>
            <p className="quote-availability-notice">
              La disponibilité du matériel est confirmée par MY DDAY EVENT après réception de votre demande. L’envoi d’un devis ne constitue pas une réservation automatique.
            </p>
            <label className="quote-consent"><input required type="checkbox" /> J’accepte que mes informations soient utilisées pour répondre à cette demande de devis. <Link href="/confidentialite">Politique de confidentialité</Link></label>
          </section>
        )}

        <div className="quote-step-actions">
          {step > 0 && <button className="button" onClick={() => continueTo(step - 1)} type="button"><ArrowLeft size={15} aria-hidden="true" /> Retour</button>}
          {step < 2 ? (
            <button className="button button-dark" onClick={() => continueTo(step + 1)} type="button">
              {step === 0 ? "Continuer vers mon événement" : "Vérifier ma demande"} <ArrowRight size={15} aria-hidden="true" />
            </button>
          ) : (
            <button className="button button-dark" disabled={isSubmitting} type="submit">
              {isSubmitting ? <><LoaderCircle className="quote-spinner" size={16} aria-hidden="true" /> Transmission en cours…</> : <>Envoyer ma demande <ArrowRight size={15} aria-hidden="true" /></>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

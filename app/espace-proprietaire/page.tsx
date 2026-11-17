import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { OwnerDashboard } from "@/components/admin/OwnerDashboard";
import { getOwnerSession } from "@/lib/supabase/owner";

export const metadata: Metadata = { title: "Espace propriétaire" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, adminClient, owner, authenticated, error } = await getOwnerSession();
  if (!supabase) {
    return (
      <section className="owner-placeholder">
        <div className="owner-icon"><LockKeyhole size={23} aria-hidden="true" /></div>
        <span className="eyebrow">DDAY EVENT · Gestion sécurisée</span>
        <h1>Espace propriétaire</h1>
        <p>Supabase n’est pas encore configuré. L’espace de gestion reste fermé tant que la base et le compte propriétaire ne sont pas initialisés.</p>
        <Link className="text-link" href="/espace-proprietaire/connexion">Connexion propriétaire</Link>
      </section>
    );
  }
  if (error) {
    return (
      <section className="owner-placeholder">
        <div className="owner-icon"><LockKeyhole size={23} aria-hidden="true" /></div>
        <span className="eyebrow">DDAY EVENT · Vérification requise</span>
        <h1>Accès momentanément indisponible</h1>
        <p>La session ou les permissions propriétaire n’ont pas pu être vérifiées. Aucune donnée de gestion n’a été chargée.</p>
        <Link className="text-link" href="/espace-proprietaire/connexion">Réessayer</Link>
      </section>
    );
  }
  if (!authenticated) redirect("/espace-proprietaire/connexion");
  if (!owner) {
    return (
      <section className="owner-placeholder">
        <div className="owner-icon"><LockKeyhole size={23} aria-hidden="true" /></div>
        <span className="eyebrow">DDAY EVENT · Accès restreint</span>
        <h1>Compte non autorisé</h1>
        <p>Cette adresse est authentifiée mais n’est pas inscrite comme propriétaire. Aucune donnée de gestion n’a été chargée.</p>
        <Link className="text-link" href="/espace-proprietaire/connexion">Revenir à la connexion</Link>
      </section>
    );
  }
  if (!adminClient) {
    return (
      <section className="owner-placeholder">
        <div className="owner-icon"><LockKeyhole size={23} aria-hidden="true" /></div>
        <span className="eyebrow">DDAY EVENT · Configuration requise</span>
        <h1>Administration indisponible</h1>
        <p>La session propriétaire est valide, mais la clé serveur Supabase de gestion n’est pas configurée. Aucune donnée privée n’a été chargée.</p>
        <Link className="text-link" href="/espace-proprietaire/connexion">Retour à la connexion</Link>
      </section>
    );
  }
  return <OwnerDashboard />;
}

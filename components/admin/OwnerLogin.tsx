"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function OwnerLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("La connexion propriétaire n’est pas configurée. Consultez le guide de déploiement.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Connexion refusée. Vérifiez vos identifiants ou demandez une invitation à la propriétaire du projet.");
      setLoading(false);
      return;
    }
    router.replace("/espace-proprietaire");
    router.refresh();
  }

  return (
    <section className="owner-placeholder owner-login">
      <div className="owner-icon"><LockKeyhole size={23} aria-hidden="true" /></div>
      <span className="eyebrow">MY DDAY EVENT · Gestion sécurisée</span>
      <h1>Connexion propriétaire</h1>
      {!configured && <p className="quote-error" role="status">Supabase n’est pas encore configuré. Aucune connexion ni demande n’est simulée.</p>}
      <form className="owner-login-form" onSubmit={submit}>
        <label>E-mail<input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label>Mot de passe<input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
        {error && <p className="quote-error" role="alert">{error}</p>}
        <button className="button button-dark" disabled={loading || !configured} type="submit">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p>Les comptes sont créés par invitation dans Supabase. L’inscription publique est désactivée.</p>
      <Link className="text-link" href="/">Retour au site</Link>
    </section>
  );
}

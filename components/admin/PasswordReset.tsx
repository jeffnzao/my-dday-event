"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function PasswordReset() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 12 || password !== confirmation) {
      setError("Choisissez au moins 12 caractères et confirmez exactement le nouveau mot de passe.");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase n’est pas configuré.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("Le mot de passe n’a pas pu être remplacé. Le lien est peut-être expiré.");
      return;
    }
    await supabase.auth.signOut();
    router.replace("/espace-proprietaire/connexion");
  }

  return (
    <section className="owner-placeholder owner-login">
      <span className="eyebrow">MY DDAY EVENT · Sécurité du compte</span>
      <h1>Définir un nouveau mot de passe</h1>
      <form className="owner-login-form" onSubmit={submit}>
        <label>Nouveau mot de passe
          <input autoComplete="new-password" minLength={12} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </label>
        <label>Confirmer le mot de passe
          <input autoComplete="new-password" minLength={12} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
        </label>
        {error && <p className="quote-error" role="alert">{error}</p>}
        <button className="button button-dark" disabled={loading} type="submit">
          {loading ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </form>
    </section>
  );
}

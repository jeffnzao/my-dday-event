import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Gestion des données personnelles" };

export default function Page() {
  return (
    <LegalPage
      title="Gestion des données personnelles"
      intro="Un point de contact et des modalités de traitement devront être définis avant l’ouverture du formulaire de devis."
    >
      <h2>Vos demandes</h2>
      <p>Adresse de contact pour les demandes relatives aux données : [à compléter par la propriétaire].</p>
      <h2>Suppression des données</h2>
      <p>Aucune donnée de devis n’est collectée ni conservée par cette maquette. Une procédure de demande de suppression sera définie avec le stockage réellement retenu.</p>
      <p>Pour comprendre les traitements prévus, consultez la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
    </LegalPage>
  );
}

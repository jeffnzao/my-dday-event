import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <LegalPage title="Mentions légales" intro="Informations relatives à l’éditeur et à l’hébergement du site.">
      <h2>Éditeur du site</h2>
      <p><strong>Dénomination :</strong> DDAY EVENT — [forme juridique à confirmer]</p>
      <p><strong>Numéro SIRET :</strong> [à compléter]</p>
      <p><strong>Adresse :</strong> [adresse postale à compléter]</p>
      <p><strong>Téléphone et e-mail :</strong> [coordonnées professionnelles à compléter]</p>
      <p><strong>Responsable de la publication :</strong> [à compléter]</p>
      <h2>Hébergement</h2>
      <p>[Hébergeur, adresse et coordonnées à confirmer lors du choix de l’hébergement.]</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les textes, photographies, identité graphique et autres éléments du site devront être publiés uniquement après confirmation des droits d’utilisation. Les visuels actuels sont temporaires et ne sont pas ceux du site de référence.</p>
      <h2>Responsabilité</h2>
      <p>[Modalités de responsabilité et informations applicables à valider avec la propriétaire et son conseil.]</p>
    </LegalPage>
  );
}

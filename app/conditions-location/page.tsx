import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Conditions de location" };

export default function Page() {
  return (
    <LegalPage title="Conditions de location" intro="Projet de trame à adapter aux modalités commerciales réelles de MY DDAY EVENT.">
      <h2>1. Demande et confirmation</h2>
      <p>[Définir la procédure de demande, la confirmation des disponibilités et le moment où la location devient ferme.]</p>
      <h2>2. Prix et règlement</h2>
      <p>[Tarifs, taxes, durée de location, frais et modalités de paiement à compléter.]</p>
      <h2>3. Retrait, livraison et installation</h2>
      <p>[Zones, horaires, frais, conditions d’accès, installation et retour du matériel à compléter.]</p>
      <h2>4. Utilisation et restitution</h2>
      <p>[Conditions d’utilisation, état du matériel, perte, casse et responsabilités à définir.]</p>
      <h2>5. Modification et annulation</h2>
      <p>[Délais et modalités de modification, report et annulation à définir.]</p>
      <h2>6. Données personnelles et médiation</h2>
      <p>Voir la page <a href="/confidentialite">Confidentialité</a>. [Coordonnées du médiateur de la consommation, si applicable, à compléter.]</p>
    </LegalPage>
  );
}

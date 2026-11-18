import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Confidentialité" };

export default function Page() {
  return (
    <LegalPage
      title="Confidentialité"
      intro="Cette page devra décrire les traitements de données réellement activés sur le site et les droits des personnes concernées."
    >
      <h2>Responsable du traitement</h2>
      <p>[Identité et coordonnées du responsable du traitement à compléter.]</p>
      <h2>Données et finalités</h2>
      <p>[Décrire les données collectées, leur finalité, leur base légale et leur durée de conservation après activation du formulaire de devis.]</p>
      <h2>Stockage et destinataires</h2>
      <p>[Préciser les outils, l’hébergeur, les éventuels prestataires et les durées de conservation réellement retenus.]</p>
      <h2>Vos droits</h2>
      <p>Pour exercer vos droits d’accès, de rectification, d’effacement, d’opposition, de limitation ou de portabilité, contactez : [adresse de contact à compléter].</p>
      <p>La sélection du catalogue peut être conservée dans le stockage local de votre navigateur pour la retrouver lors de votre prochaine visite. Elle n’est pas transmise au serveur ni envoyée à MY DDAY EVENT par cette maquette. La suppression des données du navigateur efface également cette sélection.</p>
    </LegalPage>
  );
}

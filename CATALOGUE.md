# Catalogue MY DDAY EVENT

## Modifier les références

Les catégories sont déclarées dans `lib/catalog/categories.ts` et les produits dans `lib/catalog/products.ts`. Chaque référence possède un identifiant stable, une catégorie, ses caractéristiques, ses variantes, ses limites de commande, son état de disponibilité et son emplacement d’image. L’ordre des entrées dans son groupe fixe son ordre d’affichage.

Les montants du document `ENTREE.odt` sont stockés en euros dans `price` (ou dans le prix de chaque variante). Le document ne précise pas le type de tarif ni sa durée. Les prix sont donc conservés mais marqués `to_confirm` et ne sont ni publiés ni utilisés pour calculer un devis. La propriétaire peut consulter et modifier ces montants dans son administration, même avant confirmation.

Pour publier un tarif après validation par la propriétaire, renseigner `pricingStatus: "confirmed"`, `priceUnit`, `displayPrice` (et le `displayPrice` de chaque variante concernée), puis activer `displayPricesPublicly` dans `catalogSettings`. Les montants ne doivent pas être convertis en prix par jour sans confirmation explicite. La visibilité publique reste désactivée par défaut ; le contrôle de l’administration peut en outre désactiver la publication globale.

Les photographies doivent remplacer `image.src` et `gallery` sur la référence correspondante avec des fichiers autorisés. Le visuel partagé `public/images/products/placeholder.svg` est explicitement temporaire.

Les packs ont leur contenu dans `packContents` et leur nombre maximal dans `packLimit`. Les éléments variables (corde, finition, couleur, lumière et dimensions saisonnières) sont décrits dans `variants`, `colors` et `dimensions`. Les valeurs manquantes doivent rester à confirmer, sans être déduites.

## Sélection et demandes de devis

La sélection et les quantités sont conservées dans le stockage local du navigateur et partagées entre la collection et la page de devis. Après consentement, le formulaire envoie la demande à l’API sécurisée ; elle n’est considérée comme transmise qu’après enregistrement confirmé par Supabase. Sans configuration valide, l’API renvoie une erreur et aucun succès fictif n’est affiché. Les coordonnées client ne sont pas sauvegardées dans le stockage local.

Le contrôle de cohérence du catalogue se lance avec `npm run test:catalog`.

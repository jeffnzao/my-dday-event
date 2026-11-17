# RAPPORT FINAL — DDAY EVENT

## A. Résumé exécutif

Le projet indépendant DDAY EVENT est implémenté et compile en production. Le site public, le catalogue, le parcours de demande de devis, les API serveur, le schéma Supabase et l’espace propriétaire sont présents. Les contrôles statiques, TypeScript, la compilation et les tests HTTP locaux effectués sur le build de production ont réussi.

**Mise à jour Mission 4 :** le catalogue compte désormais 133 références, 11 catégories et 32 variantes. Le trio de panneaux Luxe a été réintégré à la demande de la propriétaire. Voir [RAPPORT_MISSION_4_DDAY_EVENT.md](./RAPPORT_MISSION_4_DDAY_EVENT.md) pour le relevé de réconciliation le plus récent.

**Le projet n’est pas prêt pour une mise en production réelle.** Aucun projet Supabase ni compte propriétaire n’a été configuré, la migration n’a pas été exécutée à distance, et l’envoi e-mail facultatif n’a pas été configuré. Les intégrations de bout en bout avec ces services restent donc à tester. Les tarifs, photos et informations légales nécessitent aussi une validation humaine.

Le catalogue actuel conserve l’ancien identifiant stable du trio Luxe et l’a actualisé avec le choix avec/sans lumière, panneaux uniquement. Cette référence ne doit pas être considérée comme supprimée.

## B. Architecture

| Élément | Implémentation |
|---|---|
| Framework | Next.js 16 App Router |
| Frontend | React 19, TypeScript, Tailwind CSS 4, Lucide React |
| Backend | Route handlers Next.js côté serveur |
| Base de données | PostgreSQL via Supabase ; migration initiale dans `supabase/migrations/202611170001_initial_schema.sql` |
| Authentification | Supabase Auth avec session serveur/cookies et liste d’autorisation `owner_users` |
| Autorisations | Vérification du compte propriétaire côté serveur ; Row Level Security activée sur les tables |
| Hébergement envisagé | Hébergeur Node.js compatible Next.js, choisi et contrôlé par la propriétaire ; aucun déploiement effectué |
| Notifications | Resend facultatif, appelé côté serveur après enregistrement de la demande |
| Documentation/configuration | `.env.example`, `DEPLOIEMENT.md`, `CATALOGUE.md` |

Le schéma inclut `requests`, `request_items`, `products`, `owner_users`, `catalog_settings`, `site_content` et `quote_rate_limits`. La soumission enregistrée en base est atomique via une fonction RPC privée. Les prix publics sont masqués par le RPC de catalogue sauf si le prix est confirmé et que la publication est activée.

## C. Fonctionnalités

| Fonctionnalité | État | Test réalisé | Résultat |
|---|---|---|---|
| Pages publiques et navigation | Implémentées | Requêtes HTTP au build de production | `/`, `/collection`, `/mariages`, `/comment-louer`, `/devis`, pages légales et connexion propriétaire répondent HTTP 200 |
| Catalogue, recherche et catégories | Implémentés ; catalogue statique de secours disponible | `npm run test:catalog`, parcours navigateur antérieur | 133 références et 11 catégories vérifiées ; l’API de catalogue distante répond 503 sans configuration Supabase |
| Sélection et quantités | Sélection partagée entre collection et devis, conservée dans le stockage local | Parcours navigateur antérieur ; audit catalogue | Sélection restaurée pendant le parcours ; limites documentées des packs vérifiées par l’audit |
| Formulaire de devis en trois étapes | Implémenté : sélection, événement, récapitulatif | Parcours navigateur antérieur | Coordonnées, événement, consentement, récapitulatif et avertissement de non-réservation vérifiés |
| Total estimatif | Calculé uniquement avec tarifs confirmés et publiés | Parcours navigateur antérieur | Les totaux sont masqués pour les tarifs non confirmés ou non publiés |
| Validation de demande côté serveur | Implémentée : origine, champs, dates, consentement, références, variantes, quantités et limites | POST HTTP invalide et valide | Données invalides : HTTP 400. Demande valide sans configuration : HTTP 503 explicite, aucun faux succès |
| Enregistrement des demandes | Implémenté, activable après configuration Supabase | Non testable sans projet/identifiants | Aucun enregistrement distant n’est revendiqué |
| E-mails propriétaire/client | Intégrés via Resend si configuré | Non testable sans clé et domaine d’expédition | Aucun e-mail n’a été envoyé ni présenté comme envoyé |
| Espace propriétaire | Écrans de connexion et d’administration implémentés | Route HTTP et API sans configuration | Aucune donnée privée rendue sans session ; API demandes répond HTTP 503 sans backend |
| Gestion des demandes et du catalogue | UI/API d’administration implémentées | Tests de bout en bout non possibles sans compte propriétaire | Statuts, notes, recherche/filtre, édition des produits et paramètres sont à valider avec un compte réel |
| Responsive | Styles adaptatifs implémentés | Vérification navigateur antérieure à 390 px | Aucun débordement horizontal constaté sur cette largeur ; autres appareils réels non testés |
| Administration des images et contenus | Édition de chemins/URL d’image et de certains contenus | Vérification du code, sans compte live | Pas de téléversement binaire d’image dans l’admin ; textes modifiables limités à des champs de la page d’accueil |

La page affiche clairement : « La disponibilité du matériel est confirmée par DDAY EVENT après réception de votre demande. L’envoi d’un devis ne constitue pas une réservation automatique. »

## D. Catalogue

- **Références :** 133 références actives dans le catalogue local de base.
- **Catégories :** 11 : entrée et accueil, salle et cérémonie, allée centrale, tables, chaises et assises, coin photo, fleurs, accessoires et finitions, autres éléments de décoration, buffet, coin mariée prêt à emporter.
- **Variantes structurées :** 32, dont 8 variantes de compositions saisonnières selon saison et dimension.
- **Références avec dimensions :** 47.
- **Références avec couleurs :** 69.
- **Références avec prix à confirmer :** 133. Les montants transcrits depuis le document restent non confirmés et ne sont pas publiés.
- **Descriptions à compléter :** 113 références portent encore une description générique signalant des détails à confirmer.
- **Photographies originales disponibles dans le projet :** aucune photographie d’inventaire validée.
- **Placeholders :** 133 références utilisent l’image temporaire `public/images/products/placeholder.svg`.

Les limites de commande des packs coin photo sont fixées à un exemplaire ; la limite documentée des podiums fleuris est conservée à huit unités.

Les anciennes références suivantes ne figurent pas dans le catalogue actif :

- Urne de mariage
- Colonne cannelée
- Lanterne de sol
- Ancienne composition d’allée
- Nappe satinée
- Vase boule
- Présentoir à gâteau
- Chaise médaillon
- Chaise transparente
- Références historiques de panneaux autres que le trio Luxe actualisé
- Bouquet de fleurs
- Panier à pétales
- Support de signalisation

D’autres références historiques non retenues par le catalogue révisé sont également contrôlées par l’audit statique, notamment l’ancien rideau de perles, le néon « Just Married », la banquette ivoire, le fauteuil bouclé et l’ancien lettrage « Love ».

## E. Sécurité

- **Authentification :** Supabase Auth ; aucun mot de passe propriétaire n’est codé en dur. Les inscriptions publiques doivent rester désactivées. L’initialisation décrite dans `DEPLOIEMENT.md` se fait par invitation, puis autorisation de l’UUID vérifié dans `owner_users`.
- **Permissions :** les API d’administration vérifient la session et l’appartenance à `owner_users` côté serveur avant d’obtenir le client de service.
- **RLS :** activée sur les tables du schéma. L’accès direct public aux demandes est révoqué ; les opérations de soumission et de limitation sont réservées au rôle `service_role`.
- **Secrets :** la clé `SUPABASE_SERVICE_ROLE_KEY` est côté serveur uniquement. Aucun secret réel n’a été fourni ou ajouté au dépôt. `.env.example` ne contient que des valeurs fictives.
- **Validation :** les entrées sont vérifiées côté serveur avant traitement ; la soumission impose le consentement, limite la taille et la quantité, vérifie les références actives et les variantes, et contrôle l’origine.
- **Anti-abus :** limite quotidienne prévue de 3 tentatives par empreinte e-mail et de 10 par empreinte IP. Les valeurs sont hachées ; aucune procédure de purge/rétention automatique n’est définie.
- **Risques / limites restants :** le schéma et les politiques n’ont pas été exercés sur un projet distant. La configuration Supabase, les sauvegardes, la rétention des données personnelles et la purge des compteurs doivent être finalisées avant lancement.
- **Audit réalisé :** `npm run test:security` vérifie statiquement les privilèges, les RPC, les contrôles d’entrée et la présence de RLS ; ce contrôle ne remplace pas un test de pénétration ni une validation RLS sur Supabase.

## F. Configuration

Variables attendues, documentées dans `.env.example` et `DEPLOIEMENT.md` :

| Variable | Obligatoire | Usage |
|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé publique Supabase, soumise à RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui pour la soumission et l’administration | Fonctions privées et opérations serveur ; secret serveur uniquement |
| `RESEND_API_KEY` | Non | Envoi des notifications si Resend est choisi |
| `RESEND_FROM_EMAIL` | Non | Adresse d’expédition vérifiée |
| `DDAY_EVENT_OWNER_EMAIL` | Non | Adresse de notification de la propriétaire |

Aucune de ces valeurs de production n’est configurée. La migration SQL, l’invitation/autorisation du compte propriétaire, les URLs de redirection Auth, les e-mails et le domaine restent à configurer dans les comptes contrôlés par la propriétaire.

## G. Tests

| Test | Résultat réel |
|---|---|
| `npm run typecheck` | Réussi (`tsc --noEmit`) après les modifications finales |
| `npm run test:catalog` | Réussi : 133 références, 11 catégories, 32 variantes structurées, dont 8 tarifées par saison et taille |
| `npm run test:security` | Réussi : contrôles statiques RLS, privilèges RPC, secret serveur, validation et limitation de soumission |
| `npm run build` | Réussi ; Next.js a compilé et généré les pages/routes de production |
| Pages publiques | Réussi : les neuf pages testées répondent HTTP 200 |
| Route propriétaire sans configuration | Réussi : la page ne rend pas de données de demandes ; l’API `/api/admin/requests` renvoie HTTP 503 sans backend configuré |
| POST devis invalide | Réussi : HTTP 400 |
| POST devis valide sans services configurés | Réussi : HTTP 503 et message indiquant explicitement que la demande n’a pas été envoyée |
| API catalogue sans Supabase | HTTP 503 ; aucun résultat distant n’est simulé |
| Parcours navigateur / responsive | Vérification antérieure : sélection conservée entre collection et devis, récapitulatif/prix non confirmés, consentement, erreurs de transmission, absence de débordement horizontal à 390 px |
| Soumission réelle, authentification propriétaire, RLS distante et e-mails | Non testés : identifiants/services externes absents |

**Avertissement de compilation :** le binaire natif SWC Windows fourni dans l’environnement n’est pas chargeable. Le script de build utilise Webpack et Next.js a terminé avec ses liaisons WASM ; la compilation s’est achevée avec succès malgré les avertissements SWC.

## H. Déploiement

1. Créer sous le compte de la propriétaire un projet d’hébergement compatible avec Next.js 16 et un projet Supabase.
2. Exécuter intégralement `supabase/migrations/202611170001_initial_schema.sql` dans le SQL Editor Supabase.
3. Désactiver les inscriptions publiques, inviter la propriétaire, puis ajouter son UUID vérifié à `public.owner_users`. Configurer les URL de redirection Auth de production et de développement.
4. Renseigner les variables du tableau F dans les paramètres de l’hébergeur ; garder la clé de service en secret serveur et ne jamais la préfixer par `NEXT_PUBLIC_`.
5. Installer les dépendances (`npm ci`), puis exécuter `npm run typecheck`, `npm run test:catalog`, `npm run test:security` et `npm run build`.
6. Déployer depuis un dépôt et un compte contrôlés par la propriétaire. Se connecter à l’administration et initialiser les 133 références de base ; relire les produits et ne pas écraser les modifications déjà en base.
7. Tester une demande réelle sur l’environnement de préproduction : présence en base, lecture propriétaire, statuts, notes, limites, notification. Nettoyer/annuler la demande de test selon la politique retenue.
8. Ajouter le domaine chez l’hébergeur et le registrar en suivant leurs valeurs DNS exactes ; attendre et vérifier le certificat HTTPS.
9. Mettre à jour les URL de domaine et redirections dans Supabase Auth, puis refaire les tests d’authentification, de devis et d’e-mail sur HTTPS.

Supabase et Resend peuvent avoir des offres gratuites ou économiques, mais les quotas, sauvegardes et tarifs changent ; les vérifier avant de choisir. Le domaine est généralement payant. Une migration vers un autre hébergeur Node.js ou PostgreSQL est possible, mais nécessitera d’adapter les intégrations et l’authentification.

## I. Reste à faire

### Intervention de la propriétaire

- Créer et contrôler les comptes d’hébergement et Supabase, exécuter la migration et terminer la procédure d’invitation/autorisation.
- Confirmer les prix, leur unité et leur durée ; décider si et quand chaque tarif peut être publié.
- Fournir des photographies autorisées et remplacer chaque placeholder.
- Compléter les coordonnées et informations légales réelles, les mentions réglementaires et la politique de confidentialité.
- Décider de la durée de conservation des demandes, de la purge des empreintes anti-abus et de la politique de sauvegarde.
- Choisir et configurer le domaine et, si souhaité, Resend avec un expéditeur vérifié.

### Validation technique après configuration

- Appliquer et tester réellement RLS avec les rôles anon, utilisateur authentifié non propriétaire, propriétaire et service.
- Tester l’invitation/connexion, l’ensemble des écrans d’administration et le parcours devis enregistré en bout en bout.
- Vérifier les envois réels de notification propriétaire et de confirmation client, ainsi que les erreurs/échecs partiels.
- Réaliser les tests sur appareils mobiles réels et sur le domaine HTTPS final.
- Surveiller les quotas, sauvegardes, erreurs et limites d’hébergement en production.

### Limites actuelles de l’administration

- Les produits peuvent être classés parmi les 11 catégories existantes ; l’édition de la taxonomie et la création de catégories ne sont pas prévues.
- Les champs de page d’accueil modifiables couvrent l’accroche et l’introduction, pas l’ensemble des contenus éditoriaux.
- Les photos se modifient avec un chemin local ou une URL HTTPS ; le téléversement binaire depuis l’admin n’est pas implémenté.
- Variantes et galeries sont gérées par des champs structurés/JSON dans l’interface ; leur ergonomie doit être évaluée par la propriétaire.

## J. État de livraison

- **Terminé :** architecture et pages publiques, catalogue administrable côté code et prêt à être initialisé, sélection persistante, parcours de devis, API sécurisées, schéma SQL/RLS, interface propriétaire, documentation de configuration et de déploiement.
- **Vérifié localement :** TypeScript, audits catalogue/sécurité, build optimisé et réponses HTTP des pages ; les erreurs de configuration empêchent bien un faux envoi.
- **À configurer :** projet Supabase, migration, compte autorisé, variables secrètes, hébergement, domaine et notifications facultatives.
- **À valider par la propriétaire :** tarifs, photographies, informations légales, politique de conservation et sauvegardes.
- **À tester après configuration :** enregistrement réel des demandes, permissions/RLS sur le service distant, administration authentifiée, e-mails, domaine et HTTPS.

**Conclusion : le livrable est prêt pour configuration et recette, mais pas pour une mise en production publique avant l’accomplissement des tâches de configuration, de validation métier et de tests externes listées ci-dessus.**

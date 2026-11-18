# RAPPORT FINAL — MY DDAY EVENT

## A. Renommage

| Élément | Statut |
|---|---|
| Ancien chemin historique | `C:\projets\Nouveau dossier` — absent dans cet environnement |
| Chemin réellement initial | `C:\projets\dday-event` |
| Nouveau chemin demandé | `C:\projets\my-dday-event` |
| Conservation des fichiers | **BLOQUÉ** — VS Code utilise actuellement le dossier actif ; le renommage physique n’a pas été appliqué |
| Identité commerciale | `MY DDAY EVENT` appliquée aux entêtes, pieds de page, métadonnées, pages publiques, administration, confirmations et e-mails |
| Identifiants techniques | Inchangés : dépôt `dday-event`, routes, tables, variables d’environnement et migrations |

Éléments visibles renommés :

- entête et pied de page ;
- titre et modèle de titre SEO ;
- page d’accueil et légende éditoriale ;
- catalogue et demandes de devis ;
- pages juridiques et confidentialité ;
- connexion et administration propriétaire ;
- sujets et contenus HTML des notifications de devis ;
- contenu initial du site dans la migration Supabase.

## B. GitHub

| Élément | Résultat |
|---|---|
| Dépôt existant | `https://github.com/jeffnzao/my-dday-event.git` |
| Remote | `origin` mis à jour vers l’URL canonique du dépôt déplacé |
| Branche principale | `main` |
| État initial | Branche locale à jour de `origin/main` ; seul `.env.example` était modifié localement |
| Dernier commit vérifié | `2592776 chore: initialisation du projet DDAY EVENT` |
| Accès distant | Fetch/présence du remote vérifiés ; aucun push effectué |
| Commit effectué | `9dfac10` — `chore: rename brand to MY DDAY EVENT and configure CI` |
| Push | Réussi normalement vers `main`, sans `--force` |
| Fichiers secrets exclu ou retirés | `.env*` ignoré sauf `.env.example` ; seules des valeurs fictives restent dans `.env.example` |

Aucun secret réel n’a été ajouté à la configuration. Aucun fichier `.env` n’est suivi. Aucun secret Supabase ou Resend n’est placé dans les workflows GitHub Actions.

## C. Supabase

| Élément | Résultat |
|---|---|
| Projet distant | **NON INTERROGÉ** — aucune configuration locale Vercel/Supabase CLI ni autorisation de requête distante |
| URL publique attendue | `NEXT_PUBLIC_SUPABASE_URL` |
| Clé publique attendue | `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou équivalent publishable |
| Clé privilégiée attendue | `SUPABASE_SERVICE_ROLE_KEY`, serveur uniquement |
| Résend facultatif | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `DDAY_EVENT_OWNER_EMAIL` |
| Migration 001 | Tables, RLS, privilèges, politiques, RPC et fonctions de limitation |
| Migration 002 | Désactive les références retirées et réconcilie le trio Luxe |
| Ordre | `202611170001_initial_schema.sql`, puis `202611170002_catalog_reconciliation.sql` |
| Application distante | **Non exécutée** — aucune autorisation ni reset ; aucune donnée modifiée |

Variables nécessaires :

| Variable | Usage | Exposition |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Connexion Supabase | Publique |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accès contrôlé par RLS | Publique |
| `SUPABASE_SERVICE_ROLE_KEY` | Opérations serveur privilégiées | Secrète |
| `RESEND_API_KEY` | Notifications e-mail | Secrète |
| `RESEND_FROM_EMAIL` | Expéditeur vérifié | Serveur |
| `DDAY_EVENT_OWNER_EMAIL` | Notification propriétaire | Serveur |

## D. Vercel

| Élément | Résultat |
|---|---|
| Projet associé | **À confirmer depuis le tableau de bord Vercel** |
| Dépôt connecté | Remote GitHub existant identifié |
| Framework | Next.js |
| Build | `npm run build` |
| Installation | `npm ci` |
| Node recommandé | Node 22 |
| `.vercel` | Aucun lien local présent |
| Variables | Non modifiées ni extraites |
| Déploiement Preview | **Non lancé** — absence de contexte Vercel local |
| Production | **Non lancée** |
| Domaine | **Non vérifié** depuis Vercel |

Aucun nouveau projet Vercel n’a été créé et aucune variable existante n’a été supprimée.

## E. GitHub Actions

Créé : `.github/workflows/ci.yml`

- déclencheurs : push et pull request vers `main` ;
- Node 22 ;
- installation reproductible avec `npm ci` ;
- test catalogue ;
- test sécurité ;
- vérification TypeScript ;
- build de production ;
- permissions limitées à `contents: read`.

## F. Tests

| Contrôle | Résultat |
|---|---|
| `npm run test:catalog` | Réussi — 133 références, 11 catégories, 32 variantes |
| `npm run test:security` | Réussi — RLS, privilèges RPC, secret serveur et limites vérifiés |
| `npm run typecheck` | Réussi |
| `npm run build` | Réussi avec le fallback Webpack/WASM |
| Pages publiques | HTTP 200 pour toutes les routes demandées |
| APIs publiques | HTTP 503 attendu sans configuration Supabase locale |
| Admin | HTTP 200 sur le placeholder, sans compte réel validé |
| Supabase réel | Non testé |
| E-mails Réel | Non testés |

Route HTTP vérifiées : `/`, `/collection`, `/mariages`, `/comment-louer`, `/devis`, `/mentions-legales`, `/confidentialite`, `/conditions-location`, `/gestion-donnees-personnelles`, `/espace-proprietaire`, `/espace-proprietaire/connexion`.

## G. Actions restantes

- Fermer les processus qui verrouillent `C:\projets\dday-event`, puis renommer physiquement le dossier en `C:\projets\my-dday-event`.
- Ajouter, vérifier et pousser explicitement le commit.
- Fournir ou confirmer l’accès au projet Supabase existant avant toute migration distante.
- Exécuter les migrations 001 puis 002 uniquement après autorisation.
- Vérifier les politiques RLS et les données sur le projet Supabase réel.
- Confirmer le projet Vercel, le domaine, les variables des environnements Preview/Production et la branche de production.
- Préparer un Preview puis obtenir l’autorisation avant tout déploiement de production.
- Vérifier le domaine HTTPS, l’authentification propriétaire, les e-mails et une demande de devis réelle.

| Statut | Signification |
|---|---|
| **TERMINÉ ET VÉRIFIÉ** | Action réellement exécutée et contrôlée |
| **PRÉPARÉ MAIS NON EXÉCUTÉ** | Configuration prête, mais pas encore appliquée |
| **ACTION REQUISE DE MA PART** | Intervention ou autorisation nécessaire |
| **BLOQUÉ** | Impossible de continuer, avec explication |

État global :

| Statut | Élément |
|---|---|
| TERMINÉ ET VÉRIFIÉ | Renommage commercial visible, `.env.example` assaini, audits catalogue/sécurité/TypeScript/build, workflow CI, recette HTTP locale |
| PRÉPARÉ MAIS NON EXÉCUTÉ | Commit, push GitHub, Preview Vercel |
| ACTION REQUISE DE MA PART | Autorisation Supabase/Vercel, fermeture de VS Code pour le renommage physique |
| BLOQUÉ | Renommage de dossier, migration distante, déploiement production, validations externes Supabase/Vercel |

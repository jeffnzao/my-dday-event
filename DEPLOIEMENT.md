# Configuration et déploiement MY DDAY EVENT

## Services et coûts

- **Application :** Next.js et React, hébergés sur une plateforme compatible Node.js (Vercel ou un hébergement Node indépendant).
- **Données et authentification :** Supabase (PostgreSQL, Auth, politiques RLS). Le projet appartient au compte de la propriétaire.
- **E-mails facultatifs :** Resend est intégré côté serveur. Les notifications ne partent que si les trois variables `RESEND_API_KEY`, `RESEND_FROM_EMAIL` et `DDAY_EVENT_OWNER_EMAIL` sont configurées. La transmission de la demande en base est indépendante de leur disponibilité.
- **Domaine :** acheté et renouvelé auprès du registrar choisi par la propriétaire.

Le code n’impose pas de fournisseur d’hébergement ou d’e-mail payant. Les offres gratuites et leurs limites évoluent ; vérifier quotas, politiques de sauvegarde, limites de stockage, régions et conditions en vigueur avant de choisir un fournisseur. Le domaine reste généralement payant. Pour migrer, l’application peut être hébergée sur tout serveur Node.js compatible avec Next.js ; PostgreSQL peut être déplacé vers une autre instance en adaptant les accès/authentification.

## Variables d’environnement

Copier `.env.example` vers `.env.local` en développement, ou saisir ces variables dans l’espace de configuration du fournisseur en production :

| Variable | Exposition | Obligatoire | Usage |
|---|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Navigateur et serveur | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Navigateur et serveur | Oui | Clé publique Supabase ; les politiques RLS limitent les accès |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement | Oui pour envoyer un devis | Appel des fonctions privées de limitation anti-abus et d’enregistrement atomique. Ne jamais la préfixer par `NEXT_PUBLIC_` ni la publier |
| `RESEND_API_KEY` | Serveur uniquement | Non | Envoi des e-mails via Resend |
| `RESEND_FROM_EMAIL` | Serveur uniquement | Non | Adresse d’expédition vérifiée chez Resend |
| `DDAY_EVENT_OWNER_EMAIL` | Serveur uniquement | Non | Adresse de notification de la propriétaire |

Ne pas committer `.env.local`. Aucun mot de passe propriétaire, clé service ou compte de démonstration n’est présent dans le code.

## Initialisation Supabase et du compte propriétaire

1. Créer le projet Supabase depuis le compte contrôlé par la propriétaire. Choisir une région adaptée et conserver les identifiants dans son gestionnaire de mots de passe.
2. Ouvrir le SQL Editor et exécuter dans l’ordre [`supabase/migrations/202611170001_initial_schema.sql`](./supabase/migrations/202611170001_initial_schema.sql), puis [`supabase/migrations/202611170002_catalog_reconciliation.sql`](./supabase/migrations/202611170002_catalog_reconciliation.sql). Le premier crée `requests`, `request_items`, `products`, `catalog_settings`, `site_content`, `owner_users`, les relations, les politiques RLS et les fonctions RPC contrôlées ; le second désactive les références retirées encore présentes et actualise la fiche du trio Luxe si elle existe.
3. Dans Supabase Auth, désactiver les inscriptions publiques et inviter l’adresse e-mail de la propriétaire. Configurer les URL de redirection pour le domaine de production et `http://localhost:3000/**` en développement.
4. Après acceptation de l’invitation, récupérer l’UUID du compte dans **Authentication → Users**, puis l’autoriser en exécutant dans le SQL Editor :

   ```sql
   insert into public.owner_users (user_id)
   values ('UUID_DU_COMPTE_INVITE');
   ```

   Remplacer le texte par l’UUID vérifié ; ne pas créer de mot de passe dans le dépôt. La ligne d’autorisation est contrôlée par RLS ; un compte simplement authentifié ne suffit pas.
5. Copier l’URL, la clé publique/anon et la clé `service_role` depuis les réglages Supabase vers les variables d’environnement correspondantes. La clé `service_role` doit rester exclusivement côté serveur.
6. Dans l’espace propriétaire, choisir **Catalogue → Initialiser les références de base**. L’import ajoute les 133 références de base sans écraser celles déjà présentes. Relire les produits, détails et montants avant toute publication.
7. Ajouter les photos autorisées : déposer les fichiers dans `public/images/` et référencer leur chemin `/images/...`, ou utiliser une URL HTTPS. Remplacer les placeholders au fur et à mesure.

Les demandes et les produits sont en base après configuration. Les demandes client ne peuvent être lues que par un compte présent dans `owner_users`. Les prix bruts du catalogue ne sont pas lisibles directement par le rôle public ; le RPC public les masque jusqu’à ce que la propriétaire confirme le prix et active la publication. Les enregistrements de limitation quotidiens ne contiennent que des empreintes SHA-256 ; une politique de purge doit être définie selon la rétention souhaitée.

## Configuration des e-mails

1. Créer le compte de l’expéditeur chez Resend, vérifier un domaine contrôlé par la propriétaire et suivre ses instructions DNS.
2. Créer une clé API à portée minimale et renseigner `RESEND_API_KEY`, l’adresse expéditrice vérifiée dans `RESEND_FROM_EMAIL` et l’adresse de réception dans `DDAY_EVENT_OWNER_EMAIL`.
3. Faire un envoi de test réel après déploiement. Le code envoie une notification à la propriétaire et une confirmation au client. La page affiche explicitement si les e-mails n’étaient pas configurés, ont échoué ou n’ont été délivrés que partiellement. Aucun e-mail n’est prétendu envoyé sans réponse positive du fournisseur.

## Déploiement

1. Créer le projet d’hébergement sous le compte de la propriétaire et connecter le dépôt privé qu’elle contrôle. Choisir une version Node compatible avec Next.js 16.
2. Renseigner les variables du tableau ci-dessus dans les environnements de prévisualisation et de production. Vérifier particulièrement que la clé `service_role` est une variable secrète serveur.
3. Créer le projet Supabase de la propriétaire, exécuter la migration et terminer l’invitation/autorisation du compte. Prévoir sauvegardes et accès restreints au tableau de bord.
4. Lancer `npm ci`, `npm run typecheck`, `npm run test:catalog`, `npm run test:security` et `npm run build`, puis déployer le build de production. Ne pas utiliser un compte ou un domaine tiers non contrôlé par la propriétaire.
5. Tester en production `/`, `/collection`, `/devis`, `/espace-proprietaire/connexion`, les API publiques et l’espace propriétaire. Envoyer une demande de test de bout en bout, vérifier son enregistrement et sa consultation, puis la supprimer ou l’annuler conformément à la politique de conservation retenue.
6. Ajouter le domaine personnalisé dans l’hébergeur et le registrar ; saisir exactement les enregistrements DNS indiqués par l’hébergeur (CNAME ou A/AAAA selon le cas). Ne pas réutiliser de valeurs DNS provenant d’un compte tiers.
7. Attendre la validation DNS et le certificat TLS automatique, puis vérifier le domaine en HTTPS, les redirections et les URL autorisées Supabase Auth. Ne pas activer de redirection vers une adresse de connexion non sécurisée.
8. Refaire le test du formulaire et les tests de notification sur le domaine HTTPS final ; vérifier l’arrivée de la demande en base, le statut de notification e-mail et l’accès propriétaire.

Pour changer de domaine, mettre à jour l’URL principale et les URL de redirection dans Supabase Auth, configurer le nouveau domaine chez l’hébergeur et le registrar, vérifier le certificat HTTPS, puis refaire les tests d’authentification, formulaire et e-mail. Aucune adresse de domaine ou de déploiement n’est figée dans le code.

## Limites à lever avant production

- La migration SQL n’est pas appliquée à un projet Supabase distant ; aucun identifiant externe n’a été fourni.
- Sans Supabase, l’API refuse l’envoi avec une erreur explicite et ne présente pas une fausse confirmation.
- Sans Resend configuré, la demande peut être enregistrée, mais aucun e-mail n’est envoyé ; l’espace propriétaire doit être consulté.
- Les prix de `ENTREE.odt` restent à confirmer par la propriétaire et les placeholders doivent être remplacés par des médias autorisés.
- Compléter les informations légales, la durée de conservation des données et la politique de sauvegarde avant d’ouvrir le site au public.

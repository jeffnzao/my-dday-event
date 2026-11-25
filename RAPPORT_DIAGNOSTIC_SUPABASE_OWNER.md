# Rapport — Diagnostic Supabase propriétaire MY DDAY EVENT

## 1. Cause exacte du message de configuration manquante

Le message « Supabase n’est pas encore configuré » est produit dans [OwnerLogin.tsx](./components/admin/OwnerLogin.tsx) lorsque `createSupabaseBrowserClient()` retourne `null`.

La condition exacte est :

- `NEXT_PUBLIC_SUPABASE_URL` est absente ou vide ; ou
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` est absente ou vide.

L’application lit `.env.local` automatiquement via Next.js. `.env.example` n’est pas lu comme fichier de configuration runtime. Au moment du diagnostic, `.env.local` existait avec les trois variables attendues et le serveur Next.js confirmait `Environments: .env.local`. Une autre cause possible du message était un ancien processus Next.js démarré avant la configuration locale ou avant son rechargement.

## 2. Variables attendues

- Navigationnaire : `NEXT_PUBLIC_SUPABASE_URL`
- Navigationnaire : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Serveur Next.js : `NEXT_PUBLIC_SUPABASE_URL`
- Serveur Next.js : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Client privilégié serveur : `SUPABASE_SERVICE_ROLE_KEY`
- Proxy Next.js : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Authentification propriétaire : les variables publiques ci-dessus
- Stockage des médias : URL publique Supabase plus la clé serveur réservée au serveur

Les valeurs de `.env.local` ne sont pas reproduites dans ce rapport.

## 3. Fichiers corrigés

- [`.env.example`](./.env.example) : remplacement des anciennes clés réelles par des emplacements fictifs ;
- [lib/supabase/owner.ts](./lib/supabase/owner.ts) : absence normale de session distinguée d’une erreur serveur ;
- [scripts/audit-security.cjs](./scripts/audit-security.cjs) : contrôles ajoutés pour cette condition et pour le rôle propriétaire ;
- aucun fichier dans `fds-adhesion-crm`.

Les initialisateurs restent centralisés dans :

- [lib/supabase/browser.ts](./lib/supabase/browser.ts)
- [lib/supabase/server.ts](./lib/supabase/server.ts)
- [lib/supabase/service.ts](./lib/supabase/service.ts)
- [proxy.ts](./proxy.ts)

## 4. Authentification propriétaire

Le compte réel n’a pas été modifié et aucun mot de passe n’a été saisi ou créé.

La vérification serveur actuelle exige :

1. une session Supabase Auth valide ;
2. une présence dans `owner_users` ;
3. un rôle `owner` dans `app_metadata.role` ou `app_metadata.roles`.

La présence dans `owner_users` seule ne suffit plus. Cela vérifie la cohérence entre l’inscription propriétaire Supabase et les métadonnées d’application.

Les résultats sans session sont désormais :

- page `/espace-proprietaire` : redirection vers la connexion ;
- routes API administratives : HTTP 401 ;
- aucun accès aux données ou au client serveur privilégié.

La session active doit être créée uniquement par `supabase.auth.signInWithPassword()` dans [OwnerLogin.tsx](./components/admin/OwnerLogin.tsx).

## 5. Diagnostic d’hydratation

Le différentiel initial concernant `data-processed-169095215="true"` sur `<html>` n’a pas été reproduit dans une page ouverte par le navigateur de test.

Le code applicatif ne possède aucun `suppressHydrationWarning`, aucune injection de cet attribut sur `<html>`, aucune utilisation directe de `Date.now()` ou `Math.random()` pour produire des attributs HTML, et aucun format de date durant le rendu du layout.

Les attributs HTML observés dans la page étaient uniquement `lang="fr"`. Aucun message React d’hydratation ou d’console n’a été enregistré lors du rechargement testé.

Le nom `data-processed-*` est typique d’une extension ou d’un script injecté côté navigateur. Cette cause n’est donc pas confirmée comme applicative. Test recommandé : désactiver les extensions, charger la page en fenêtre privée, puis recharger avec les outils développeurs ouverts.

## 6. Tests exécutés

- `npm run test:catalog` : réussi, 137 références vérifiées.
- `npm run test:security` : réussi.
- `npm run typecheck` : réussi.
- `npm run build` : réussi.
- `git diff --check` : réussi.
- `/` : HTTP 200 et rendu public vérifié.
- `/espace-proprietaire/connexion` : HTTP 200, formulaire et bouton de connexion visibles, aucun message de configuration manquante.
- `/espace-proprietaire` sans session : redirection vers la connexion vérifiée après correction.
- API propriétaire sans session : HTTP 401 vérifié pour les routes produits et médias.
- `.env.local` chargé par Next.js au démarrage : confirmé.
- URL Supabase locale : HTTPS valide avec un hôte `*.supabase.co` ; la valeur n’est pas reproduite.
- Hydratation : aucun avertissement reproduit dans le navigateur de test.

## 7. Actions manuelles restantes

1. Relancer Next.js après toute modification de `.env.local` si un ancien processus est encore actif.
2. Tester une connexion réelle uniquement avec les identifiants maîtrisés par la propriétaire.
3. Vérifier dans le navigateur la valeur effective de `app_metadata.role === "owner"` après la connexion.
4. Vérifier les URL de redirection Supabase Auth pour la production et `http://localhost:3000/**`.
5. Désactiver les extensions du navigateur pour confirmer que l’attribut injecté ne vient pas d’une extension.

Aucune donnée Supabase n’a été créée ou supprimée, aucun mot de passe n’a été modifié, aucune migration n’a été relancée, aucun push ou déploiement n’a été effectué.

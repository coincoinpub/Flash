# Connecter Flash Impression à Supabase + Google (crm.flashimpression@gmail.com)

Ce document liste les étapes à faire une seule fois pour activer :
- une base de données partagée (tout le monde voit les mêmes dossiers, en direct) ;
- la synchro automatique de la Planification vers **Google Agenda** ;
- un export automatique vers un **Google Sheet** ;
- un **récap email quotidien à 8h30** (RDV, jobs, poses, livraisons, deadlines du jour).

Tout le code est déjà écrit et poussé sur la branche. Tant que les variables ci-dessous ne sont
pas renseignées dans Vercel, l'app continue de fonctionner exactement comme avant (localStorage,
sur ce navigateur uniquement) — rien ne casse entre-temps.

Je ne peux pas créer ces comptes à ta place (Supabase, Google Cloud) : ce sont des étapes que tu
dois faire toi-même, ça prend une quinzaine de minutes. Une fois fait, dis-moi et je termine les
branchements/tests.

## 1. Supabase (base de données)

1. Va sur [supabase.com](https://supabase.com), crée un compte et un nouveau projet (région
   Europe conseillée, ex. `eu-central-1`).
2. Dans le projet → **SQL Editor** → colle le contenu de `supabase/schema.sql` (dans ce repo) →
   Run. Ça crée les tables `dossiers`, `membres`, `rappels_envoyes`.
3. Dans **Project Settings → API**, récupère :
   - `Project URL` → `VITE_SUPABASE_URL` **et** `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secrète, jamais dans le frontend)

## 2. Google Cloud (compte crm.flashimpression@gmail.com)

1. Connecte-toi sur [console.cloud.google.com](https://console.cloud.google.com) **avec le
   compte crm.flashimpression@gmail.com**.
2. Crée un projet (ex. "Flash Impression CRM").
3. **APIs & Services → Library** → active ces 3 API :
   - Google Calendar API
   - Google Sheets API
   - Gmail API
4. **APIs & Services → OAuth consent screen** :
   - Type "External", statut "Testing" suffit (pas besoin de validation Google).
   - Ajoute `crm.flashimpression@gmail.com` comme "Test user".
5. **APIs & Services → Credentials → Create Credentials → OAuth client ID** :
   - Type : "Web application".
   - Nom libre (ex. "Flash CRM sync").
   - Dans "Authorized redirect URIs", ajoute exactement : `http://localhost:53682/oauth2callback`
   - Crée → note le **Client ID** et le **Client Secret**.

### Obtenir le refresh token (une seule fois, en local)

Sur ta machine, dans le dossier du projet :

```bash
npm install
GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/get-google-refresh-token.mjs
```

Ouvre l'URL affichée, connecte-toi avec **crm.flashimpression@gmail.com**, accepte les
autorisations (Agenda, Sheets, envoi d'email). Le terminal affiche le refresh token → note-le.

→ `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

### Google Sheet

Crée un Google Sheet (depuis le compte crm.flashimpression@gmail.com, ou partage-le en édition
avec ce compte). Renomme le premier onglet en **"Dossiers"** (exactement, sensible à la casse).
Récupère l'ID dans l'URL : `https://docs.google.com/spreadsheets/d/`**`CET_ID`**`/edit`.

→ `GOOGLE_SHEET_ID`

## 3. Variables sur Vercel

Dans le projet Vercel → **Settings → Environment Variables**, ajoute toutes les variables
listées dans `.env.example` (Production + Preview) :

| Variable | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | Project URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | clé anon Supabase |
| `SUPABASE_URL` | Project URL Supabase (identique) |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service_role Supabase |
| `GOOGLE_CLIENT_ID` | depuis Google Cloud |
| `GOOGLE_CLIENT_SECRET` | depuis Google Cloud |
| `GOOGLE_REFRESH_TOKEN` | depuis le script |
| `GOOGLE_CALENDAR_ID` | `primary` |
| `GOOGLE_SHEET_ID` | ID du Google Sheet |
| `RAPPEL_DESTINATAIRE` | `crm.flashimpression@gmail.com` |
| `CRON_SECRET` | une valeur aléatoire de ton choix (ex. générée sur [1password.com/password-generator](https://1password.com/password-generator/)) |

Redéploie ensuite le projet (un `git push` suffit, ou "Redeploy" dans Vercel) pour que les
nouvelles variables soient prises en compte.

## 4. Vérifier

- Ouvre l'app : les dossiers de démo doivent apparaître (chargés depuis Supabase désormais).
- Modifie une date de planification sur un dossier → sous quelques secondes, l'évènement doit
  apparaître dans l'agenda Google de crm.flashimpression@gmail.com, et la ligne correspondante
  dans le Google Sheet doit se mettre à jour.
- Le récap email part automatiquement tous les jours vers 8h30 (heure de Paris) s'il y a au
  moins une échéance ce jour-là — sinon un email "rien de planifié" est quand même envoyé pour
  confirmer que le système tourne (on pourra changer ce comportement si tu préfères le silence
  les jours vides).

## À savoir

- **Sécurité** : comme le reste de l'app aujourd'hui, il n'y a pas de compte utilisateur/mot de
  passe — quiconque a le lien Vercel peut lire/modifier les dossiers. C'est cohérent avec l'usage
  actuel (outil interne, lien non public), mais dis-le-moi si tu veux qu'on ajoute un mot de passe
  d'accès simple à ce stade.
- **Rappels par personne** : pour l'instant le récap est global sur une seule boîte mail, comme
  demandé. Le jour où tu veux un récap personnalisé par membre de l'équipe, il faudra leur email
  dans la fiche équipe — dis-le-moi.

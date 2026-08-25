# Flash Impression — Suivi CRM

Outil web de suivi des dossiers pour Flash Impression (imprimerie et signalétique, Bergerac), pensé pour remplacer le tableau Velléda.

## Ce que couvre l'app

- **Kanban** : `Devis`, `PAO`, `À imprimer`, `À facturer`, `Livré / Archivé` (groupes *à faire* / *en cours* selon la colonne).
- Glisser-déposer réel des cartes (HTML5 drag & drop), pastilles d'équipe multi-sélection ("Qui fait quoi").
- **Fiche détail** (modale, clic sur une carte, édition en ligne) : n° de devis, n° client, job, date, statut, équipe assignée, Planification (RDV client, job, pose ext./int., livraison, deadline), note libre, archivage/suppression.
- **Planning 3 semaines glissantes** sous le Kanban, alimenté automatiquement par la Planification de chaque dossier.
- Gestion d'équipe (ajout/retrait/édition des membres), filtre par membre.
- Mode « Écran d'aperçu » : bascule en grand format, centré, pour un écran dédié.
- **Données** : Supabase (base partagée temps réel) si configuré, sinon `localStorage` du navigateur — voir `SETUP.md`.
- **Intégrations optionnelles** (voir `SETUP.md`) : synchro Google Agenda + Google Sheet à chaque modification, récap email quotidien à 8h30 (RDV/jobs/poses/livraisons/deadlines du jour) via le compte crm.flashimpression@gmail.com.

## Aller plus loin

- `SETUP.md` : activer Supabase + Google (agenda, sheet, rappel email).
- Import régulier de la liste clients depuis un export CSV/Excel de Ciel — pas encore fait.
- Rappels personnalisés par membre d'équipe (au lieu d'un récap global) — pas encore fait.

## Développement

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production (tsc + vite build)
npm run lint      # oxlint
```

Stack : React 19 + TypeScript + Vite + Tailwind CSS v4, Supabase (base de données), fonctions serverless Vercel (`api/`) pour la synchro Google Agenda/Sheet et le rappel quotidien. Fonctionne aussi sans rien configurer (données de démo + `localStorage`), voir `SETUP.md`.

# Flash Impression — Suivi CRM

Outil web de suivi des dossiers pour Flash Impression (imprimerie et signalétique, Bergerac), pensé pour remplacer le tableau Velléda.

## Ce que couvre cette maquette

- **Kanban** avec colonnes simplifiées : `Nouveau`, `Devis` (regroupe *à faire* / *en cours*), `PAO` (regroupe *à faire* / *en cours*), `À imprimer`, `Prêt`, `À facturer`, `Livré`.
- Code couleur des colonnes : gris (Nouveau), bleu (étapes commerciales), orange (PAO), ambre (production), vert (terminé).
- Glisser-déposer réel des cartes (HTML5 drag & drop), sauvegarde immédiate dans le navigateur (`localStorage`).
- **Fiche détail** au clic sur une carte : n° de devis, n° client, date, statut, commercial / PAO / atelier assignés, RDV (date + heure), commentaire libre.
- **Planning 3 semaines glissantes** (lun.–ven.) sous le Kanban, alimenté automatiquement par les dossiers (RDV client, job/impression, pose extérieure, pose intérieure, livraison, deadline), avec le code couleur demandé.
- Filtre par membre de l'équipe (avatars cliquables ou menu déroulant).
- Mode « Écran d'aperçu » : bascule en grand format, sans interaction, pour un écran dédié.

## Ce qui reste à construire (hors maquette)

Ces points nécessitent un backend partagé et ne sont pas dans cette itération :

- Base de données partagée (ex. Google Sheets) à la place du stockage local navigateur.
- Ajout / retrait de membres d'équipe.
- Relances automatiques par mail (dossier qui stagne, rappel RDV la veille).
- Import régulier de la liste clients depuis un export CSV/Excel de Ciel.
- Actualisation automatique de l'écran d'aperçu (rafraîchissement live multi-poste).

## Développement

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production (tsc + vite build)
npm run lint      # oxlint
```

Stack : React 19 + TypeScript + Vite + Tailwind CSS v4, sans backend (données de démonstration + `localStorage`).

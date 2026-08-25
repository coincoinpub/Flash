-- Flash Impression CRM — schéma Supabase
-- À exécuter une fois dans l'éditeur SQL de ton projet Supabase (https://supabase.com/dashboard → SQL Editor).

create table if not exists membres (
  id text primary key,
  nom text not null default '',
  initiales text not null default '',
  role text not null default 'commercial',
  pole text not null default 'impression',
  couleur text not null default '#2563eb'
);

create table if not exists dossiers (
  id text primary key,
  reference text not null default '',
  numero_client text not null default '',
  client text not null default '',
  job text not null default '',
  statut text not null default 'devis_a_faire',
  ordre integer not null default 0,
  date date not null default current_date,
  commercial_ids text[] not null default '{}',
  pao_ids text[] not null default '{}',
  atelier_ids text[] not null default '{}',
  rdv jsonb,
  date_impression date,
  date_impression_moment text not null default 'matin',
  date_livraison date,
  date_livraison_moment text not null default 'matin',
  livraison_info text not null default '',
  deadline date,
  deadline_moment text not null default 'matin',
  deadline_info text not null default '',
  pose_ext date,
  pose_ext_moment text not null default 'matin',
  pose_ext_info text not null default '',
  pose_int date,
  pose_int_moment text not null default 'apres_midi',
  pose_int_info text not null default '',
  commentaire text not null default '',
  -- id de l'évènement Google Calendar créé pour chaque type de planification, pour pouvoir
  -- le mettre à jour/supprimer plutôt que d'en recréer un à chaque modification.
  google_event_ids jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Table technique : évite d'envoyer deux fois le récap du jour si le cron se déclenche
-- plus d'une fois le même jour (garde-fou heure d'été/hiver, voir api/cron/rappel-quotidien.ts).
create table if not exists rappels_envoyes (
  jour date primary key,
  envoye_at timestamptz not null default now()
);

alter table dossiers enable row level security;
alter table membres enable row level security;
alter table rappels_envoyes enable row level security;

-- Outil interne sans compte utilisateur : on autorise la clé "anon" à tout lire/écrire sur
-- dossiers/membres (comme le localStorage aujourd'hui). Le lien Vercel n'est pas indexé/public.
-- rappels_envoyes n'est manipulée que côté serveur (clé service_role, qui ignore RLS de toute façon).
create policy "lecture publique dossiers" on dossiers for select using (true);
create policy "ecriture publique dossiers" on dossiers for insert with check (true);
create policy "modification publique dossiers" on dossiers for update using (true);
create policy "suppression publique dossiers" on dossiers for delete using (true);

create policy "lecture publique membres" on membres for select using (true);
create policy "ecriture publique membres" on membres for insert with check (true);
create policy "modification publique membres" on membres for update using (true);
create policy "suppression publique membres" on membres for delete using (true);

-- Active la réplication temps réel (pour que deux personnes ouvrant l'app voient les
-- mêmes changements en direct, comme sur un vrai CRM partagé).
alter publication supabase_realtime add table dossiers;
alter publication supabase_realtime add table membres;

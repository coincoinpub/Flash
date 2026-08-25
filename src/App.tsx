import { useMemo, useState } from 'react'
import { useDossiers } from './hooks/useDossiers'
import { useMembres } from './hooks/useMembres'
import { useTheme } from './hooks/useTheme'
import { construireNouveauDossier } from './lib/creerDossier'
import { KanbanBoard } from './components/KanbanBoard'
import { Planning } from './components/Planning'
import { DossierDetail } from './components/DossierDetail'
import { TeamPanel } from './components/TeamPanel'
import { Avatar } from './components/Avatar'
import type { Dossier } from './types'

function App() {
  const { dossiers, updateDossier, reorderDossier, addDossier, removeDossier, clearMembreReferences } = useDossiers()
  const { membres, updateMembre, addMembre, removeMembre } = useMembres()
  const { theme, toggleTheme } = useTheme()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtreMembreId, setFiltreMembreId] = useState<string>('')
  const [displayMode, setDisplayMode] = useState(false)
  const [equipeOuverte, setEquipeOuverte] = useState(false)

  const membresParId = useMemo(() => Object.fromEntries(membres.map((m) => [m.id, m])), [membres])

  const dossiersFiltres = useMemo(() => {
    if (!filtreMembreId) return dossiers
    return dossiers.filter(
      (d) =>
        d.commercialIds.includes(filtreMembreId) ||
        d.paoIds.includes(filtreMembreId) ||
        d.atelierIds.includes(filtreMembreId),
    )
  }, [dossiers, filtreMembreId])

  const selectedDossier: Dossier | null = selectedId ? (dossiers.find((d) => d.id === selectedId) ?? null) : null

  const handleCreateDossier = () => {
    const nouveau = construireNouveauDossier(dossiers)
    addDossier(nouveau)
    setSelectedId(nouveau.id)
  }

  const handleArchiveDossier = () => {
    if (selectedId) reorderDossier(selectedId, 'archive', Number.MAX_SAFE_INTEGER)
    setSelectedId(null)
  }

  const handleDeleteDossier = () => {
    if (selectedId) removeDossier(selectedId)
    setSelectedId(null)
  }

  const handleRemoveMembre = (id: string) => {
    removeMembre(id)
    clearMembreReferences(id)
    if (filtreMembreId === id) setFiltreMembreId('')
  }

  return (
    <div className={`min-h-screen flex flex-col ${displayMode ? 'p-6' : 'p-4 md:p-6'}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className={`font-bold text-slate-900 dark:text-slate-100 ${displayMode ? 'text-3xl' : 'text-xl'}`}>
            Flash Impression
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Suivi des dossiers — imprimerie &amp; signalétique, Bergerac
          </p>
        </div>

        {!displayMode && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="border border-slate-300 dark:border-slate-600 rounded-md px-2.5 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
              value={filtreMembreId}
              onChange={(e) => setFiltreMembreId(e.target.value)}
            >
              <option value="">Toute l'équipe</option>
              {membres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
            <div className="flex items-center -space-x-1.5">
              {membres.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFiltreMembreId(filtreMembreId === m.id ? '' : m.id)}
                  className={`rounded-full ring-2 transition ${
                    filtreMembreId === m.id ? 'ring-indigo-500 scale-110' : 'ring-white dark:ring-slate-900'
                  }`}
                >
                  <Avatar membre={m} />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setEquipeOuverte(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded p-1"
              aria-label="Gérer l'équipe"
              title="Gérer l'équipe"
            >
              ✏️
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 bg-white dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
            aria-label="Changer de thème"
          >
            {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode((v) => !v)}
            className="text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 bg-white dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {displayMode ? '✕ Quitter le mode affichage' : '⛶ Écran d’aperçu'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        <KanbanBoard
          dossiers={dossiersFiltres}
          membresParId={membresParId}
          onReorder={reorderDossier}
          onCardClick={(d) => setSelectedId(d.id)}
          onCreateDossier={handleCreateDossier}
          displayMode={displayMode}
        />

        <Planning dossiers={dossiersFiltres} onSelectDossier={(d) => setSelectedId(d.id)} displayMode={displayMode} />
      </main>

      {selectedDossier && (
        <DossierDetail
          dossier={selectedDossier}
          membres={membres}
          onClose={() => setSelectedId(null)}
          onUpdate={(patch) => updateDossier(selectedDossier.id, patch)}
          onArchive={handleArchiveDossier}
          onDelete={handleDeleteDossier}
        />
      )}

      {equipeOuverte && (
        <TeamPanel
          membres={membres}
          onClose={() => setEquipeOuverte(false)}
          onUpdate={updateMembre}
          onAdd={addMembre}
          onRemove={handleRemoveMembre}
        />
      )}
    </div>
  )
}

export default App

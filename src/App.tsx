import { useMemo, useState } from 'react'
import { MEMBRES } from './data/mockData'
import { useDossiers } from './hooks/useDossiers'
import { useTheme } from './hooks/useTheme'
import { KanbanBoard } from './components/KanbanBoard'
import { Planning } from './components/Planning'
import { DossierDetail } from './components/DossierDetail'
import { Avatar } from './components/Avatar'
import type { Dossier } from './types'

function App() {
  const { dossiers, updateDossier, moveDossier } = useDossiers()
  const { theme, toggleTheme } = useTheme()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtreMembreId, setFiltreMembreId] = useState<string>('')
  const [displayMode, setDisplayMode] = useState(false)

  const membresParId = useMemo(() => Object.fromEntries(MEMBRES.map((m) => [m.id, m])), [])

  const dossiersFiltres = useMemo(() => {
    if (!filtreMembreId) return dossiers
    return dossiers.filter(
      (d) =>
        d.commercialId === filtreMembreId ||
        d.paoId === filtreMembreId ||
        d.atelierId === filtreMembreId ||
        d.enChargeId === filtreMembreId,
    )
  }, [dossiers, filtreMembreId])

  const selectedDossier: Dossier | null = selectedId ? (dossiers.find((d) => d.id === selectedId) ?? null) : null

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
              {MEMBRES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
            <div className="flex items-center -space-x-1.5 mr-1">
              {MEMBRES.map((m) => (
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
          onMove={moveDossier}
          onCardClick={(d) => setSelectedId(d.id)}
          displayMode={displayMode}
        />

        <Planning dossiers={dossiersFiltres} onSelectDossier={(d) => setSelectedId(d.id)} displayMode={displayMode} />
      </main>

      {selectedDossier && (
        <DossierDetail
          dossier={selectedDossier}
          membres={MEMBRES}
          onClose={() => setSelectedId(null)}
          onUpdate={(patch) => updateDossier(selectedDossier.id, patch)}
        />
      )}
    </div>
  )
}

export default App

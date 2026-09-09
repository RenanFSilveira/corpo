'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type LastSet = {
  ordemSerie: number
  pesoKg: number | null
  reps: number | null
  tag: string | null
  unilateral: boolean
}

export type ExerciseData = {
  id: string
  exerciseId: string
  nome: string
  grupo: string
  ordem: number
  seriesAlvo: number
  repsAlvo: string
  notas: string | null
  lastSets: LastSet[]
}

type SetEntry = {
  pesoKg: string
  reps: string
  tag: 'ok' | 'queimou' | 'difícil' | ''
  unilateral: boolean
}

const COMO_FOI_OPTIONS = [
  { value: 'ótimo', label: '🔥 Ótimo' },
  { value: 'bom', label: '💪 Bom' },
  { value: 'ok', label: '👍 Ok' },
  { value: 'cansativo', label: '😮‍💨 Cansativo' },
  { value: 'difícil', label: '😤 Difícil' },
]

const TAG_OPTIONS: { value: SetEntry['tag']; label: string }[] = [
  { value: 'ok', label: '✓' },
  { value: 'queimou', label: '🔥' },
  { value: 'difícil', label: '💪' },
]

function makeInitialSets(ex: ExerciseData): SetEntry[] {
  const count = Math.max(ex.seriesAlvo, ex.lastSets.length)
  return Array.from({ length: count }, (_, i) => {
    const last = ex.lastSets[i]
    return {
      pesoKg: last?.pesoKg != null ? String(last.pesoKg) : '',
      reps: last?.reps != null ? String(last.reps) : '',
      tag: '',
      unilateral: last?.unilateral ?? false,
    }
  })
}

function ExerciseCard({
  ex,
  sets,
  onChange,
}: {
  ex: ExerciseData
  sets: SetEntry[]
  onChange: (sets: SetEntry[]) => void
}) {
  const hasLastSession = ex.lastSets.length > 0
  const lastPeso = ex.lastSets[0]?.pesoKg
  const lastReps = ex.lastSets[0]?.reps

  const updateSet = (i: number, field: keyof SetEntry, value: string | boolean) => {
    const next = sets.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    onChange(next)
  }

  const addSet = () =>
    onChange([
      ...sets,
      {
        pesoKg: sets[sets.length - 1]?.pesoKg ?? '',
        reps: sets[sets.length - 1]?.reps ?? '',
        tag: '',
        unilateral: sets[sets.length - 1]?.unilateral ?? false,
      },
    ])

  const removeSet = () => {
    if (sets.length > 1) onChange(sets.slice(0, -1))
  }

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden">
      {/* Exercise header */}
      <div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base">{ex.nome}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {ex.seriesAlvo}×{ex.repsAlvo}
              {ex.notas ? ` · ${ex.notas}` : ''}
              {hasLastSession && lastPeso != null
                ? ` · último: ${lastPeso}kg×${lastReps ?? '?'}`
                : ''}
            </p>
          </div>
          <span className="text-xs text-gray-600 capitalize mt-0.5">{ex.grupo}</span>
        </div>
      </div>

      {/* Set rows */}
      <div className="divide-y divide-gray-700/50">
        {sets.map((set, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-gray-500 w-4 shrink-0">{i + 1}</span>

            {/* Peso */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                inputMode="decimal"
                value={set.pesoKg}
                onChange={(e) => updateSet(i, 'pesoKg', e.target.value)}
                placeholder="—"
                className="w-16 text-center bg-gray-700 rounded-lg py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-xs text-gray-500 mt-0.5">kg</span>
            </div>

            <span className="text-gray-600">×</span>

            {/* Reps */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                inputMode="numeric"
                value={set.reps}
                onChange={(e) => updateSet(i, 'reps', e.target.value)}
                placeholder="—"
                className="w-14 text-center bg-gray-700 rounded-lg py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-xs text-gray-500 mt-0.5">reps</span>
            </div>

            {/* Tag */}
            <div className="flex gap-1 ml-auto">
              {TAG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateSet(i, 'tag', set.tag === opt.value ? '' : opt.value)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    set.tag === opt.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Unilateral */}
            <button
              type="button"
              onClick={() => updateSet(i, 'unilateral', !set.unilateral)}
              className={`text-xs px-2 py-1 rounded-md shrink-0 transition-colors ${
                set.unilateral ? 'bg-blue-600/30 text-blue-400' : 'text-gray-600 bg-gray-700/50'
              }`}
              title="Unilateral"
            >
              ←→
            </button>
          </div>
        ))}
      </div>

      {/* Add/remove */}
      <div className="px-4 pb-3 pt-1 flex gap-2">
        <button
          type="button"
          onClick={addSet}
          className="flex-1 py-2 text-sm text-green-400 bg-gray-700/50 rounded-lg"
        >
          + Série
        </button>
        {sets.length > 1 && (
          <button
            type="button"
            onClick={removeSet}
            className="px-4 py-2 text-sm text-gray-500 bg-gray-700/50 rounded-lg"
          >
            −
          </button>
        )}
      </div>
    </div>
  )
}

export default function TreinoForm({
  templateId,
  templateNome,
  exercises,
}: {
  templateId: string
  templateNome: string
  exercises: ExerciseData[]
}) {
  const router = useRouter()

  const [allSets, setAllSets] = useState<Record<string, SetEntry[]>>(() =>
    Object.fromEntries(exercises.map((ex) => [ex.exerciseId, makeInitialSets(ex)]))
  )

  const [duracaoMin, setDuracaoMin] = useState('')
  const [comoFoi, setComoFoi] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  const handleExerciseChange = useCallback((exerciseId: string, sets: SetEntry[]) => {
    setAllSets((prev) => ({ ...prev, [exerciseId]: sets }))
  }, [])

  async function handleSave() {
    setStatus('saving')

    const sets: {
      exerciseId: string
      ordemSerie: number
      pesoKg: number | null
      reps: number | null
      tag: string | null
      unilateral: boolean
    }[] = []

    for (const ex of exercises) {
      const exSets = allSets[ex.exerciseId] ?? []
      exSets.forEach((s, i) => {
        sets.push({
          exerciseId: ex.exerciseId,
          ordemSerie: i + 1,
          pesoKg: s.pesoKg !== '' ? parseFloat(s.pesoKg) : null,
          reps: s.reps !== '' ? parseInt(s.reps, 10) : null,
          tag: s.tag || null,
          unilateral: s.unilateral,
        })
      })
    }

    const today = new Date().toISOString().slice(0, 10)

    const res = await fetch('/api/sessao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        data: today,
        duracaoMin: duracaoMin ? parseInt(duracaoMin, 10) : null,
        comoFoi: comoFoi || null,
        observacoes: observacoes || null,
        sets,
      }),
    })

    if (res.ok) {
      setStatus('done')
    } else {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-6xl">🎉</div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Treino salvo!</h2>
          <p className="text-gray-400">{templateNome} registrado com sucesso.</p>
        </div>
        <button
          onClick={() => router.push('/treino')}
          className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-semibold text-lg transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-400 text-lg"
        >
          ‹
        </button>
        <h1 className="text-xl font-bold">{templateNome}</h1>
      </div>

      {/* Exercises */}
      <div className="px-5 space-y-4">
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex.exerciseId}
            ex={ex}
            sets={allSets[ex.exerciseId] ?? []}
            onChange={(sets) => handleExerciseChange(ex.exerciseId, sets)}
          />
        ))}

        {/* Session meta */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
            Sobre o treino
          </h3>

          {/* Duração */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-300 w-24 shrink-0">Duração</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="number"
                inputMode="numeric"
                value={duracaoMin}
                onChange={(e) => setDuracaoMin(e.target.value)}
                placeholder="—"
                className="w-20 text-center bg-gray-700 rounded-lg py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-sm text-gray-400">min</span>
            </div>
          </div>

          {/* Como foi */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">Como foi</label>
            <div className="flex flex-wrap gap-2">
              {COMO_FOI_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setComoFoi(comoFoi === opt.value ? '' : opt.value)}
                  className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                    comoFoi === opt.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Opcional..."
              rows={3}
              className="w-full bg-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
        <div className="max-w-md mx-auto">
          {status === 'error' && (
            <p className="text-red-400 text-sm text-center mb-2">
              Erro ao salvar. Tente novamente.
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-2xl font-semibold text-lg transition-colors"
          >
            {status === 'saving' ? 'Salvando...' : 'Salvar Treino'}
          </button>
        </div>
      </div>
    </div>
  )
}

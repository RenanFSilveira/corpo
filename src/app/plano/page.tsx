import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SnapshotButtons from './SnapshotButtons'

export const dynamic = 'force-dynamic'

const GRUPO_EMOJI: Record<string, string> = {
  empurrar: '🫷',
  puxar: '🤜',
  pernas: '🦵',
  ombro: '💪',
  braço: '💪',
  core: '🏋️',
}

export default async function PlanoPage() {
  const templates = await prisma.workoutTemplate.findMany({
    orderBy: { ordem: 'asc' },
    include: {
      exercises: {
        orderBy: { ordem: 'asc' },
        include: { exercise: true },
      },
      sessions: {
        orderBy: [{ data: 'desc' }],
        take: 1,
        select: { data: true, comoFoi: true },
      },
    },
  })

  const totalSessoes = await prisma.workoutSession.count()

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur px-5 pt-10 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/treino" className="text-gray-400 text-xl">‹</Link>
          <div>
            <h1 className="text-xl font-bold">Plano & Rotina</h1>
            <p className="text-gray-400 text-xs">{totalSessoes} sessões registradas</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* Objetivo */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Objetivo</p>
          <p className="font-medium">Hipertrofia funcional — Full Body 3×/semana</p>
          <p className="text-sm text-gray-400">Progressão de carga progressiva com A → B → C em rodízio</p>
        </div>

        {/* Phases */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fases</p>
          <div className="space-y-2">
            {[
              { label: 'Fase 1', desc: 'Adaptação (4 sem) — aprender os movimentos, foco na execução' },
              { label: 'Fase 2', desc: 'Volume base (8 sem) — aumentar carga progressivamente' },
              { label: 'Fase 3', desc: 'Intensidade (8 sem) — técnicas avançadas, supersets' },
            ].map((f) => (
              <div key={f.label} className="flex gap-3">
                <span className="text-xs bg-green-800 text-green-300 px-2 py-0.5 rounded-full font-semibold h-fit mt-0.5">
                  {f.label}
                </span>
                <p className="text-sm text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Treinos
          </h2>
          <div className="space-y-4">
            {templates.map((t) => {
              const lastDate = t.sessions[0]?.data
              const lastDateLabel = lastDate
                ? new Date(lastDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                : null

              return (
                <div key={t.id} className="bg-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-bold">{t.nome}</h3>
                    {lastDateLabel && (
                      <span className="text-xs text-gray-500">último {lastDateLabel}</span>
                    )}
                  </div>
                  <div className="divide-y divide-gray-700/60">
                    {t.exercises.map((te) => (
                      <div key={te.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{GRUPO_EMOJI[te.exercise.grupo] ?? '•'}</span>
                          <div>
                            <p className="text-sm font-medium">{te.exercise.nome}</p>
                            {te.notas && (
                              <p className="text-xs text-gray-500">{te.notas}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-green-400 font-semibold flex-shrink-0">
                          {te.seriesAlvo}×{te.repsAlvo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Export */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Exportar snapshot
          </h2>
          <SnapshotButtons />
        </div>
      </div>
    </div>
  )
}

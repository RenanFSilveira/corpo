import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import MiniChart from './MiniChart'

export const dynamic = 'force-dynamic'

const GRUPO_LABEL: Record<string, string> = {
  empurrar: 'Empurrar',
  puxar: 'Puxar',
  pernas: 'Pernas',
  ombro: 'Ombros',
  braço: 'Braços',
  core: 'Core',
}

export default async function ProgressaoPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: [{ grupo: 'asc' }, { nome: 'asc' }],
    include: {
      setLogs: {
        orderBy: { createdAt: 'asc' },
        select: {
          pesoKg: true,
          reps: true,
          ordemSerie: true,
          createdAt: true,
          session: { select: { data: true } },
        },
      },
    },
  })

  type ExData = {
    id: string
    nome: string
    grupo: string
    lastPeso: number | null
    lastReps: number | null
    history: { date: string; maxPeso: number | null; reps: number | null }[]
  }

  const grouped = new Map<string, ExData[]>()

  for (const ex of exercises) {
    if (ex.setLogs.length === 0) continue

    const byDate = new Map<string, { date: string; maxPeso: number | null; reps: number | null }>()
    for (const log of ex.setLogs) {
      const dateStr = log.session.data.toISOString().split('T')[0]
      const existing = byDate.get(dateStr)
      const peso = log.pesoKg
      if (!existing) {
        byDate.set(dateStr, { date: dateStr, maxPeso: peso, reps: log.reps })
      } else if (peso != null && (existing.maxPeso == null || peso > existing.maxPeso)) {
        byDate.set(dateStr, { date: dateStr, maxPeso: peso, reps: log.reps })
      }
    }

    const history = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
    const last = history[history.length - 1]

    const data: ExData = {
      id: ex.id,
      nome: ex.nome,
      grupo: ex.grupo,
      lastPeso: last?.maxPeso ?? null,
      lastReps: last?.reps ?? null,
      history,
    }

    if (!grouped.has(ex.grupo)) grouped.set(ex.grupo, [])
    grouped.get(ex.grupo)!.push(data)
  }

  const hasData = grouped.size > 0

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur px-5 pt-10 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/treino" className="text-gray-400 text-xl">‹</Link>
          <div>
            <h1 className="text-xl font-bold">Progressão</h1>
            <p className="text-gray-400 text-xs">Evolução de carga por exercício</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {!hasData && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📈</p>
            <p className="font-medium">Nenhuma sessão registrada ainda</p>
            <p className="text-sm mt-1">Registre treinos para ver sua progressão</p>
            <Link
              href="/treino"
              className="mt-4 inline-block px-5 py-2 bg-green-700 rounded-xl text-white text-sm font-medium"
            >
              Registrar treino
            </Link>
          </div>
        )}

        {Array.from(grouped.entries()).map(([grupo, exList]) => (
          <div key={grupo}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {GRUPO_LABEL[grupo] ?? grupo}
            </h2>
            <div className="space-y-3">
              {exList.map((ex) => {
                const trend =
                  ex.history.length >= 2
                    ? (() => {
                        const prev = ex.history[ex.history.length - 2].maxPeso
                        const curr = ex.history[ex.history.length - 1].maxPeso
                        if (prev == null || curr == null) return null
                        if (curr > prev) return 'up'
                        if (curr < prev) return 'down'
                        return 'flat'
                      })()
                    : null

                const lastDateLabel =
                  ex.history.length > 0
                    ? new Date(ex.history[ex.history.length - 1].date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })
                    : null

                return (
                  <div key={ex.id} className="bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{ex.nome}</p>
                        {lastDateLabel && (
                          <p className="text-xs text-gray-500 mt-0.5">{lastDateLabel}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {ex.lastPeso != null ? (
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-green-400">{ex.lastPeso}kg</span>
                            {trend === 'up' && <span className="text-green-400 text-sm">↑</span>}
                            {trend === 'down' && <span className="text-red-400 text-sm">↓</span>}
                            {trend === 'flat' && <span className="text-gray-400 text-sm">→</span>}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">sem carga</span>
                        )}
                        {ex.lastReps != null && (
                          <p className="text-xs text-gray-400">{ex.lastReps} reps</p>
                        )}
                      </div>
                    </div>
                    {ex.history.filter((h) => h.maxPeso != null).length >= 2 && (
                      <MiniChart data={ex.history} />
                    )}
                    {ex.history.length === 1 && (
                      <p className="text-xs text-gray-600 mt-1">1 sessão — registre mais para ver o gráfico</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

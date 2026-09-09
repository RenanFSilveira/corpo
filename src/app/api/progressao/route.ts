import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
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
          session: {
            select: { data: true },
          },
        },
      },
    },
  })

  const result = exercises
    .filter((ex) => ex.setLogs.length > 0)
    .map((ex) => {
      // Group by session date, pick max weight per session
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

      return {
        id: ex.id,
        nome: ex.nome,
        grupo: ex.grupo,
        lastPeso: last?.maxPeso ?? null,
        lastReps: last?.reps ?? null,
        history,
      }
    })

  return NextResponse.json(result)
}

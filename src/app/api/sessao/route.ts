import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SetInput = {
  exerciseId: string
  ordemSerie: number
  pesoKg: number | null
  reps: number | null
  tag: string | null
  unilateral: boolean
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { templateId, data, duracaoMin, comoFoi, observacoes, sets } = body as {
    templateId: string
    data: string
    duracaoMin?: number | null
    comoFoi?: string | null
    observacoes?: string | null
    sets: SetInput[]
  }

  if (!templateId || !data || !Array.isArray(sets)) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const session = await prisma.workoutSession.create({
    data: {
      templateId,
      data: new Date(data),
      duracaoMin: duracaoMin ?? null,
      comoFoi: comoFoi ?? null,
      observacoes: observacoes ?? null,
      setLogs: {
        create: sets.map((s) => ({
          exerciseId: s.exerciseId,
          ordemSerie: s.ordemSerie,
          pesoKg: s.pesoKg,
          reps: s.reps,
          tag: s.tag,
          unilateral: s.unilateral,
        })),
      },
    },
  })

  return NextResponse.json({ ok: true, sessionId: session.id })
}

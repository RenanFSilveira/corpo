import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TreinoForm, { type ExerciseData } from './TreinoForm'

export const dynamic = 'force-dynamic'

export default async function TreinoTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { templateId } = await params

  const template = await prisma.workoutTemplate.findUnique({
    where: { id: templateId },
    include: {
      exercises: {
        orderBy: { ordem: 'asc' },
        include: { exercise: true },
      },
    },
  })

  if (!template) notFound()

  // For each exercise, get last session's set logs
  const exercises: ExerciseData[] = await Promise.all(
    template.exercises.map(async (te) => {
      const lastSetLog = await prisma.setLog.findFirst({
        where: { exerciseId: te.exerciseId },
        orderBy: { createdAt: 'desc' },
        select: { sessionId: true },
      })

      const lastSets = lastSetLog
        ? await prisma.setLog.findMany({
            where: { exerciseId: te.exerciseId, sessionId: lastSetLog.sessionId },
            orderBy: { ordemSerie: 'asc' },
            select: {
              ordemSerie: true,
              pesoKg: true,
              reps: true,
              tag: true,
              unilateral: true,
            },
          })
        : []

      return {
        id: te.id,
        exerciseId: te.exerciseId,
        nome: te.exercise.nome,
        grupo: te.exercise.grupo,
        ordem: te.ordem,
        seriesAlvo: te.seriesAlvo,
        repsAlvo: te.repsAlvo,
        notas: te.notas ?? null,
        lastSets,
      }
    })
  )

  return (
    <TreinoForm
      templateId={template.id}
      templateNome={template.nome}
      exercises={exercises}
    />
  )
}

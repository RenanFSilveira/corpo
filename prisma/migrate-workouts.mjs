import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Skip if migration already applied (Mesa flexora exists = new plan is in place)
  const marker = await prisma.exercise.findFirst({ where: { nome: 'Mesa flexora' } })
  if (marker) {
    console.log('✅ Migração de treinos já aplicada, pulando.')
    return
  }

  console.log('Migrando treinos para o novo plano personalizado...')

  // ─── 1. Create new exercises ─────────────────────────────────────────────
  const newExercises = [
    { nome: 'Mesa flexora', grupo: 'pernas' },
    { nome: 'Crossover polia baixa→cima', grupo: 'empurrar' },
    { nome: 'Bíceps unilateral banco Scott', grupo: 'braço', notas: 'cada lado' },
    { nome: 'Cadeira extensora', grupo: 'pernas' },
    { nome: 'Peitoral voador máquina', grupo: 'empurrar' },
    { nome: 'Abdominal máquina', grupo: 'core' },
  ]

  for (const ex of newExercises) {
    const existing = await prisma.exercise.findFirst({ where: { nome: ex.nome } })
    if (!existing) {
      await prisma.exercise.create({ data: ex })
      console.log(`  + Criado: ${ex.nome}`)
    } else {
      console.log(`  = Já existe: ${ex.nome}`)
    }
  }

  // ─── 2. Build exercise lookup ────────────────────────────────────────────
  const allExercises = await prisma.exercise.findMany()
  const byName = (nome) => {
    const found = allExercises.find(e => e.nome === nome)
    if (!found) throw new Error(`Exercise not found: ${nome}`)
    return found
  }

  // ─── 3. Fetch templates ──────────────────────────────────────────────────
  const templateA = await prisma.workoutTemplate.findFirst({ where: { nome: 'Full Body A' } })
  const templateB = await prisma.workoutTemplate.findFirst({ where: { nome: 'Full Body B' } })
  const templateC = await prisma.workoutTemplate.findFirst({ where: { nome: 'Full Body C' } })

  if (!templateA || !templateB || !templateC) {
    throw new Error('Templates A/B/C not found!')
  }

  // ─── 4. Update template exercises (delete old links, create new) ─────────
  // Only removes WorkoutTemplateExercise rows — SetLog and WorkoutSession stay intact

  // Template A — peito + quadríceps
  await prisma.workoutTemplateExercise.deleteMany({ where: { templateId: templateA.id } })
  await prisma.workoutTemplateExercise.createMany({
    data: [
      { templateId: templateA.id, exerciseId: byName('Leg press').id, ordem: 1, seriesAlvo: 3, repsAlvo: '8-12' },
      { templateId: templateA.id, exerciseId: byName('Mesa flexora').id, ordem: 2, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateA.id, exerciseId: byName('Crossover polia baixa→cima').id, ordem: 3, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateA.id, exerciseId: byName('Remada unilateral').id, ordem: 4, seriesAlvo: 3, repsAlvo: '10-12', notas: 'cada lado' },
      { templateId: templateA.id, exerciseId: byName('Bíceps unilateral banco Scott').id, ordem: 5, seriesAlvo: 3, repsAlvo: '10-12', notas: 'cada lado' },
      { templateId: templateA.id, exerciseId: byName('Prancha').id, ordem: 6, seriesAlvo: 3, repsAlvo: '30-45s' },
    ],
  })
  console.log('✓ Template A atualizado')

  // Template B — costas + glúteo/posterior
  await prisma.workoutTemplateExercise.deleteMany({ where: { templateId: templateB.id } })
  await prisma.workoutTemplateExercise.createMany({
    data: [
      { templateId: templateB.id, exerciseId: byName('Cadeira extensora').id, ordem: 1, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateB.id, exerciseId: byName('Hip thrust').id, ordem: 2, seriesAlvo: 3, repsAlvo: '10-12', notas: 'máquina ou coice na polia' },
      { templateId: templateB.id, exerciseId: byName('Peitoral voador máquina').id, ordem: 3, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateB.id, exerciseId: byName('Puxada alta / Barra').id, ordem: 4, seriesAlvo: 3, repsAlvo: '8-12' },
      { templateId: templateB.id, exerciseId: byName('Tríceps corda').id, ordem: 5, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateB.id, exerciseId: byName('Abdominal máquina').id, ordem: 6, seriesAlvo: 3, repsAlvo: '12-15', notas: 'ou elevação de pernas' },
    ],
  })
  console.log('✓ Template B atualizado')

  // Template C — pernas completo + mix
  await prisma.workoutTemplateExercise.deleteMany({ where: { templateId: templateC.id } })
  await prisma.workoutTemplateExercise.createMany({
    data: [
      { templateId: templateC.id, exerciseId: byName('Leg press').id, ordem: 1, seriesAlvo: 3, repsAlvo: '8-12', notas: 'pés mais altos = + glúteo/posterior' },
      { templateId: templateC.id, exerciseId: byName('Mesa flexora').id, ordem: 2, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateC.id, exerciseId: byName('Supino reto halteres').id, ordem: 3, seriesAlvo: 3, repsAlvo: '8-12', notas: 'máquina ou halteres' },
      { templateId: templateC.id, exerciseId: byName('Remada unilateral').id, ordem: 4, seriesAlvo: 3, repsAlvo: '10-12', notas: 'cada lado' },
      { templateId: templateC.id, exerciseId: byName('Elevação lateral').id, ordem: 5, seriesAlvo: 3, repsAlvo: '12-15' },
      { templateId: templateC.id, exerciseId: byName('Panturrilha').id, ordem: 6, seriesAlvo: 3, repsAlvo: '15-20' },
    ],
  })
  console.log('✓ Template C atualizado')

  // ─── 5. Verify history preserved ─────────────────────────────────────────
  const sessions = await prisma.workoutSession.count()
  const setLogs = await prisma.setLog.count()
  console.log(`\n✅ Migração concluída! Histórico preservado: ${sessions} sessões, ${setLogs} séries registradas.`)
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

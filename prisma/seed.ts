import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data (in order respecting foreign keys)
  await prisma.setLog.deleteMany()
  await prisma.workoutSession.deleteMany()
  await prisma.workoutTemplateExercise.deleteMany()
  await prisma.workoutTemplate.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.exam.deleteMany()

  // ─── Exames — coleta 24/07/2026 ───────────────────────────────────────────
  const coleta = new Date('2026-07-24')
  const liberacao = new Date('2026-07-27')

  await prisma.exam.createMany({
    data: [
      { nome: 'Glicose', resultado: '92', unidade: 'mg/dL', referencia: '60–99', categoria: 'metabolismo', dataColeta: coleta },
      { nome: 'Hemoglobina glicada (HbA1c)', resultado: '4,8', unidade: '%', referencia: '< 5,7', categoria: 'metabolismo', dataColeta: coleta },
      { nome: 'Insulina', resultado: '6,1', unidade: 'µUI/mL', referencia: '2,0–25,0', categoria: 'metabolismo', dataColeta: coleta },
      { nome: 'Colesterol total', resultado: '222', unidade: 'mg/dL', referencia: '< 190', categoria: 'lipídios', dataColeta: coleta },
      { nome: 'Colesterol HDL', resultado: '57', unidade: 'mg/dL', referencia: '> 40', categoria: 'lipídios', dataColeta: coleta },
      { nome: 'Triglicérides', resultado: '127', unidade: 'mg/dL', referencia: '< 150 (jejum)', categoria: 'lipídios', dataColeta: coleta },
      { nome: 'TGO / AST', resultado: '21,0', unidade: 'U/L', referencia: '< 50', categoria: 'fígado', dataColeta: coleta },
      { nome: 'TGP / ALT', resultado: '20,5', unidade: 'U/L', referencia: '< 50', categoria: 'fígado', dataColeta: coleta },
      { nome: 'GGT', resultado: '9', unidade: 'U/L', referencia: '< 70', categoria: 'fígado', dataColeta: coleta },
      { nome: 'Ureia', resultado: '33,7', unidade: 'mg/dL', referencia: '17–49', categoria: 'rim', dataColeta: coleta },
      { nome: 'Creatinina', resultado: '1,30', unidade: 'mg/dL', referencia: '0,70–1,30', categoria: 'rim', dataColeta: coleta },
      { nome: 'Taxa de filtração glomerular (CKD-EPI)', resultado: '78,67', unidade: 'mL/min/1,73m²', referencia: '> 90', categoria: 'rim', dataColeta: coleta },
      { nome: 'Ácido úrico', resultado: '7,0', unidade: 'mg/dL', referencia: '3,4–7,8', categoria: 'rim', dataColeta: coleta },
      { nome: 'Urina (EAS)', resultado: 'sem alterações', referencia: 'proteína/glicose/sangue negativos', categoria: 'rim', dataColeta: coleta },
      { nome: 'Hemograma', resultado: 'sem alterações', referencia: 'Hb 14,9 g/dL; leucócitos 5.340; plaquetas 240.000', categoria: 'sangue', dataColeta: coleta },
      { nome: 'Ferritina', resultado: '164,2', unidade: 'ng/mL', referencia: '30–476', categoria: 'sangue', dataColeta: coleta },
      { nome: 'Vitamina B12', resultado: '478', unidade: 'pg/mL', referencia: '181–906', categoria: 'sangue', dataColeta: coleta },
      { nome: 'TSH', resultado: '2,03', unidade: 'µUI/mL', referencia: '0,40–4,30', categoria: 'tireoide', dataColeta: coleta },
      { nome: 'Testosterona total', resultado: '752', unidade: 'ng/dL', referencia: '240–871', categoria: 'hormônio', dataColeta: coleta, dataLiberacao: liberacao },
      { nome: 'Homocisteína', resultado: '8,6', unidade: 'µmol/L', referencia: '5,46–16,20', categoria: 'rastreio/cardio', dataColeta: coleta, dataLiberacao: liberacao },
      { nome: 'Vitamina D (25-OH)', resultado: '31,4', unidade: 'ng/mL', referencia: 'ideal 30–60', categoria: 'vitamina', dataColeta: coleta },
      { nome: 'VDRL (sífilis)', resultado: 'Não reagente', referencia: '—', categoria: 'rastreio', dataColeta: coleta },
      { nome: 'Parasitológico de fezes', resultado: 'Negativo', referencia: '—', categoria: 'rastreio', dataColeta: coleta },
    ],
  })
  console.log('✓ Exames inseridos (23 itens)')

  // ─── Exercises ────────────────────────────────────────────────────────────
  const exercises = await Promise.all([
    // Empurrar / Peito
    prisma.exercise.create({ data: { nome: 'Supino reto halteres', grupo: 'empurrar' } }),
    prisma.exercise.create({ data: { nome: 'Crossover polia baixa→cima', grupo: 'empurrar' } }),
    prisma.exercise.create({ data: { nome: 'Peitoral voador máquina', grupo: 'empurrar' } }),
    prisma.exercise.create({ data: { nome: 'Elevação lateral', grupo: 'ombro' } }),
    // Puxar / Costas
    prisma.exercise.create({ data: { nome: 'Remada unilateral', grupo: 'puxar' } }),
    prisma.exercise.create({ data: { nome: 'Puxada alta / Barra', grupo: 'puxar' } }),
    // Pernas
    prisma.exercise.create({ data: { nome: 'Leg press', grupo: 'pernas' } }),
    prisma.exercise.create({ data: { nome: 'Mesa flexora', grupo: 'pernas' } }),
    prisma.exercise.create({ data: { nome: 'Cadeira extensora', grupo: 'pernas' } }),
    prisma.exercise.create({ data: { nome: 'Hip thrust', grupo: 'pernas' } }),
    prisma.exercise.create({ data: { nome: 'Panturrilha', grupo: 'pernas' } }),
    // Braço
    prisma.exercise.create({ data: { nome: 'Bíceps unilateral banco Scott', grupo: 'braço', notas: 'cada lado' } }),
    prisma.exercise.create({ data: { nome: 'Tríceps corda', grupo: 'braço' } }),
    // Core
    prisma.exercise.create({ data: { nome: 'Prancha', grupo: 'core' } }),
    prisma.exercise.create({ data: { nome: 'Abdominal máquina', grupo: 'core' } }),
  ])

  const ex = {
    supinoreto: exercises[0],
    crossover: exercises[1],
    voador: exercises[2],
    elevacaolateral: exercises[3],
    remadauni: exercises[4],
    puxada: exercises[5],
    legpress: exercises[6],
    mesaflexora: exercises[7],
    cadeiraextensora: exercises[8],
    hipthrust: exercises[9],
    panturrilha: exercises[10],
    bicepsscott: exercises[11],
    triceps: exercises[12],
    prancha: exercises[13],
    abdominalmaquina: exercises[14],
  }
  console.log('✓ Exercícios inseridos (15 itens)')

  // ─── Templates A / B / C ─────────────────────────────────────────────────
  const templateA = await prisma.workoutTemplate.create({ data: { nome: 'Full Body A', ordem: 1 } })
  const templateB = await prisma.workoutTemplate.create({ data: { nome: 'Full Body B', ordem: 2 } })
  const templateC = await prisma.workoutTemplate.create({ data: { nome: 'Full Body C', ordem: 3 } })

  // Template A — peito + quadríceps
  await prisma.workoutTemplateExercise.createMany({
    data: [
      { templateId: templateA.id, exerciseId: ex.legpress.id,     ordem: 1, seriesAlvo: 3, repsAlvo: '8-12' },
      { templateId: templateA.id, exerciseId: ex.mesaflexora.id,  ordem: 2, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateA.id, exerciseId: ex.crossover.id,    ordem: 3, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateA.id, exerciseId: ex.remadauni.id,    ordem: 4, seriesAlvo: 3, repsAlvo: '10-12', notas: 'cada lado' },
      { templateId: templateA.id, exerciseId: ex.bicepsscott.id,  ordem: 5, seriesAlvo: 3, repsAlvo: '10-12', notas: 'cada lado' },
      { templateId: templateA.id, exerciseId: ex.prancha.id,      ordem: 6, seriesAlvo: 3, repsAlvo: '30-45s' },
    ],
  })

  // Template B — costas + glúteo/posterior
  await prisma.workoutTemplateExercise.createMany({
    data: [
      { templateId: templateB.id, exerciseId: ex.cadeiraextensora.id, ordem: 1, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateB.id, exerciseId: ex.hipthrust.id,        ordem: 2, seriesAlvo: 3, repsAlvo: '10-12', notas: 'máquina ou coice na polia' },
      { templateId: templateB.id, exerciseId: ex.voador.id,           ordem: 3, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateB.id, exerciseId: ex.puxada.id,           ordem: 4, seriesAlvo: 3, repsAlvo: '8-12' },
      { templateId: templateB.id, exerciseId: ex.triceps.id,          ordem: 5, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateB.id, exerciseId: ex.abdominalmaquina.id,  ordem: 6, seriesAlvo: 3, repsAlvo: '12-15', notas: 'ou elevação de pernas' },
    ],
  })

  // Template C — pernas completo + mix
  await prisma.workoutTemplateExercise.createMany({
    data: [
      { templateId: templateC.id, exerciseId: ex.legpress.id,        ordem: 1, seriesAlvo: 3, repsAlvo: '8-12', notas: 'pés mais altos = + glúteo/posterior' },
      { templateId: templateC.id, exerciseId: ex.mesaflexora.id,     ordem: 2, seriesAlvo: 3, repsAlvo: '10-12' },
      { templateId: templateC.id, exerciseId: ex.supinoreto.id,      ordem: 3, seriesAlvo: 3, repsAlvo: '8-12', notas: 'máquina ou halteres' },
      { templateId: templateC.id, exerciseId: ex.remadauni.id,       ordem: 4, seriesAlvo: 3, repsAlvo: '10-12', notas: 'cada lado' },
      { templateId: templateC.id, exerciseId: ex.elevacaolateral.id, ordem: 5, seriesAlvo: 3, repsAlvo: '12-15' },
      { templateId: templateC.id, exerciseId: ex.panturrilha.id,     ordem: 6, seriesAlvo: 3, repsAlvo: '15-20' },
    ],
  })
  console.log('✓ Templates A/B/C inseridos com exercícios')

  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

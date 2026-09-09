import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') ?? 'md'
  const n = parseInt(req.nextUrl.searchParams.get('n') ?? '10', 10)

  const [exams, templates, sessions] = await Promise.all([
    prisma.exam.findMany({ orderBy: [{ categoria: 'asc' }, { nome: 'asc' }] }),
    prisma.workoutTemplate.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        exercises: {
          orderBy: { ordem: 'asc' },
          include: { exercise: { select: { nome: true, grupo: true } } },
        },
      },
    }),
    prisma.workoutSession.findMany({
      orderBy: [{ data: 'desc' }],
      take: n,
      include: {
        template: { select: { nome: true } },
        setLogs: {
          orderBy: [{ exerciseId: 'asc' }, { ordemSerie: 'asc' }],
          include: { exercise: { select: { nome: true } } },
        },
      },
    }),
  ])

  if (format === 'json') {
    const data = {
      geradoEm: new Date().toISOString(),
      objetivo: 'Full Body A/B/C — hipertrofia funcional, 3×/semana',
      exames: exams.map((e) => ({
        nome: e.nome,
        categoria: e.categoria,
        resultado: e.resultado,
        unidade: e.unidade,
        referencia: e.referencia,
        dataColeta: e.dataColeta,
      })),
      plano: templates.map((t) => ({
        nome: t.nome,
        exercicios: t.exercises.map((te) => ({
          ordem: te.ordem,
          nome: te.exercise.nome,
          grupo: te.exercise.grupo,
          series: te.seriesAlvo,
          reps: te.repsAlvo,
          notas: te.notas,
        })),
      })),
      ultimasSessoes: sessions.map((s) => ({
        data: s.data,
        treino: s.template.nome,
        duracao: s.duracaoMin,
        comoFoi: s.comoFoi,
        observacoes: s.observacoes,
        series: s.setLogs.map((sl) => ({
          exercicio: sl.exercise.nome,
          serie: sl.ordemSerie,
          peso: sl.pesoKg,
          reps: sl.reps,
          tag: sl.tag,
        })),
      })),
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="snapshot-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  }

  // Markdown
  const lines: string[] = []
  lines.push(`# Snapshot — Meu Corpo`)
  lines.push(`\nGerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`)
  lines.push(`\n## Objetivo\n\nFull Body A/B/C — hipertrofia funcional, 3×/semana`)

  // Exams grouped by category
  lines.push(`\n## Exames (coleta ${exams[0]?.dataColeta?.toLocaleDateString('pt-BR') ?? '—'})`)
  const byCategory = new Map<string, typeof exams>()
  for (const e of exams) {
    if (!byCategory.has(e.categoria)) byCategory.set(e.categoria, [])
    byCategory.get(e.categoria)!.push(e)
  }
  for (const [cat, items] of byCategory) {
    lines.push(`\n### ${capitalize(cat)}`)
    for (const e of items) {
      const val = e.unidade ? `${e.resultado} ${e.unidade}` : e.resultado
      const ref = e.referencia ? ` (ref: ${e.referencia})` : ''
      lines.push(`- **${e.nome}**: ${val}${ref}`)
    }
  }

  // Plan
  lines.push(`\n## Plano de Treino`)
  for (const t of templates) {
    lines.push(`\n### ${t.nome}`)
    for (const te of t.exercises) {
      const notas = te.notas ? ` — ${te.notas}` : ''
      lines.push(`${te.ordem}. **${te.exercise.nome}** (${te.exercise.grupo}) — ${te.seriesAlvo}×${te.repsAlvo}${notas}`)
    }
  }

  // Last N sessions
  lines.push(`\n## Últimas ${sessions.length} Sessões`)
  for (const s of sessions) {
    const date = new Date(s.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    lines.push(`\n### ${date} — ${s.template.nome}`)
    if (s.comoFoi) lines.push(`Como foi: ${s.comoFoi}`)
    if (s.duracaoMin) lines.push(`Duração: ${s.duracaoMin} min`)

    // Group set logs by exercise
    const byEx = new Map<string, typeof s.setLogs>()
    for (const sl of s.setLogs) {
      if (!byEx.has(sl.exercise.nome)) byEx.set(sl.exercise.nome, [])
      byEx.get(sl.exercise.nome)!.push(sl)
    }
    for (const [exNome, logs] of byEx) {
      const series = logs.map((sl) => {
        const peso = sl.pesoKg != null ? `${sl.pesoKg}kg` : '—'
        const reps = sl.reps != null ? `${sl.reps}reps` : '—'
        return `${peso}×${reps}`
      })
      lines.push(`- **${exNome}**: ${series.join(', ')}`)
    }
    if (s.observacoes) lines.push(`*${s.observacoes}*`)
  }

  const md = lines.join('\n')

  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="snapshot-${new Date().toISOString().split('T')[0]}.md"`,
    },
  })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

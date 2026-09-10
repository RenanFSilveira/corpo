import { spawn } from 'child_process'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function buildContext(n = 15): Promise<string> {
  const [exams, templates, sessions, lastMetric] = await Promise.all([
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
    prisma.bodyMetric.findFirst({ orderBy: { data: 'desc' } }),
  ])

  const lines: string[] = []

  lines.push('# Contexto — Meu Corpo')
  lines.push('\n## Objetivo\nFull Body A/B/C — hipertrofia funcional, 3×/semana')

  if (lastMetric?.pesoCorporal) {
    lines.push(`\n## Métricas Corporais\n- Peso atual: ${lastMetric.pesoCorporal} kg (${new Date(lastMetric.data).toLocaleDateString('pt-BR')})`)
  }

  lines.push('\n## Exames de Sangue')
  const byCategory = new Map<string, typeof exams>()
  for (const e of exams) {
    if (!byCategory.has(e.categoria)) byCategory.set(e.categoria, [])
    byCategory.get(e.categoria)!.push(e)
  }
  for (const [cat, items] of byCategory) {
    lines.push(`\n### ${cat.charAt(0).toUpperCase() + cat.slice(1)}`)
    for (const e of items) {
      const val = e.unidade ? `${e.resultado} ${e.unidade}` : e.resultado
      const ref = e.referencia ? ` (ref: ${e.referencia})` : ''
      lines.push(`- ${e.nome}: ${val}${ref}`)
    }
  }

  lines.push('\n## Plano de Treino')
  for (const t of templates) {
    lines.push(`\n### ${t.nome}`)
    for (const te of t.exercises) {
      const notas = te.notas ? ` — ${te.notas}` : ''
      lines.push(`${te.ordem}. ${te.exercise.nome} (${te.exercise.grupo}) — ${te.seriesAlvo}×${te.repsAlvo}${notas}`)
    }
  }

  lines.push(`\n## Histórico (últimas ${sessions.length} sessões)`)
  for (const s of sessions) {
    const date = new Date(s.data).toLocaleDateString('pt-BR')
    lines.push(`\n### ${date} — ${s.template.nome}`)
    if (s.comoFoi) lines.push(`Como foi: ${s.comoFoi}`)
    if (s.duracaoMin) lines.push(`Duração: ${s.duracaoMin} min`)

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
      lines.push(`- ${exNome}: ${series.join(', ')}`)
    }
    if (s.observacoes) lines.push(`Obs: ${s.observacoes}`)
  }

  return lines.join('\n')
}

const SYSTEM_PROMPT = `Você é o Coach IA do app Meu Corpo — um assistente especialista em treinamento de força, nutrição esportiva e saúde. Você tem acesso ao histórico completo de treinos, exames de sangue e composição corporal do usuário.

Responda sempre em português brasileiro. Seja direto, prático e baseado em evidências científicas. Use os dados reais do contexto ao dar recomendações de carga, progressão ou deload. Quando relevante, cite valores específicos do histórico (ex: "Na última sessão você fez 80kg×8 no agachamento, então...").

Você pode opinar sobre: ajuste de cargas, progressão de volume, deload, substituição de exercícios, interpretação de exames no contexto esportivo, e ajustes de programa. Você não faz diagnósticos médicos.`

function claudeBin(): string {
  const local = join(process.cwd(), 'node_modules/.bin/claude')
  return local
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: { role: 'user' | 'assistant'; content: string }[] = body.messages ?? []

    if (!messages.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const context = await buildContext()

    // Histórico formatado como texto — claude -p não suporta multi-turn nativo
    const history = messages
      .slice(0, -1)
      .map((m) => `**${m.role === 'user' ? 'Usuário' : 'Coach'}**: ${m.content}`)
      .join('\n\n')

    const lastMessage = messages[messages.length - 1]
    const prompt = history
      ? `${history}\n\n**Usuário**: ${lastMessage.content}`
      : lastMessage.content

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        const proc = spawn(
          claudeBin(),
          [
            '-p',
            '--bare',
            '--output-format', 'text',
            '--model', 'claude-opus-4-8',
            '--system-prompt', `${SYSTEM_PROMPT}\n\n${context}`,
            prompt,
          ],
          {
            env: { ...process.env },
            stdio: ['ignore', 'pipe', 'pipe'],
          }
        )

        proc.stdout.on('data', (chunk: Buffer) => {
          controller.enqueue(encoder.encode(chunk.toString()))
        })

        proc.stdout.on('end', () => {
          controller.close()
        })

        proc.on('error', (err) => {
          console.error('[coach] claude process error:', err)
          controller.error(err)
        })

        proc.stderr.on('data', (data: Buffer) => {
          console.error('[coach] stderr:', data.toString().trim())
        })
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[coach] API error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

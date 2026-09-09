import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TreinoPage() {
  const templates = await prisma.workoutTemplate.findMany({
    orderBy: { ordem: 'asc' },
    include: {
      sessions: {
        orderBy: [{ data: 'desc' }, { createdAt: 'desc' }],
        take: 1,
        select: { data: true },
      },
    },
  })

  const lastSession = await prisma.workoutSession.findFirst({
    orderBy: [{ data: 'desc' }, { createdAt: 'desc' }],
    include: { template: { select: { ordem: true } } },
  })

  let suggestedOrdem = 1
  if (lastSession) {
    suggestedOrdem = (lastSession.template.ordem % 3) + 1
  }

  return (
    <div className="p-5 pb-12 space-y-6">
      <div className="pt-8 flex items-center gap-3">
        <span className="text-3xl">💪</span>
        <div>
          <h1 className="text-2xl font-bold">Meu Treino</h1>
          <p className="text-gray-400 text-sm">Selecione o treino de hoje</p>
        </div>
      </div>

      <div className="space-y-3">
        {templates.map((t) => {
          const isSuggested = t.ordem === suggestedOrdem
          const lastDate = t.sessions[0]?.data
          const dateLabel = lastDate
            ? new Date(lastDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })
            : null

          return (
            <Link key={t.id} href={`/treino/${t.id}`} className="block">
              <div
                className={`rounded-2xl p-5 border-2 transition-all active:scale-98 ${
                  isSuggested
                    ? 'bg-green-900/30 border-green-600'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold">{t.nome}</h2>
                    <p className="text-sm text-gray-400">
                      {dateLabel ? `Último: ${dateLabel}` : 'Nunca realizado'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isSuggested && (
                      <span className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-full font-semibold">
                        Sugerido
                      </span>
                    )}
                    <span className="text-gray-500 text-xl">›</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="pt-2">
        <Link
          href="/exames"
          className="block w-full text-center py-3 rounded-xl border border-gray-700 text-gray-400 text-sm"
        >
          Ver exames de sangue
        </Link>
      </div>
    </div>
  )
}

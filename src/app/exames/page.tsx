import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const CATEGORIA_LABEL: Record<string, string> = {
  metabolismo: 'Metabolismo',
  lipídios: 'Lipídios',
  fígado: 'Fígado',
  rim: 'Rim & Urina',
  sangue: 'Sangue',
  tireoide: 'Tireoide',
  hormônio: 'Hormônios',
  vitamina: 'Vitaminas',
  'rastreio/cardio': 'Rastreio Cardio',
  rastreio: 'Rastreio',
}

const CATEGORIA_ORDER = [
  'metabolismo',
  'lipídios',
  'hormônio',
  'fígado',
  'rim',
  'sangue',
  'tireoide',
  'vitamina',
  'rastreio/cardio',
  'rastreio',
]

function isOutOfRange(resultado: string, referencia: string | null): boolean {
  if (!referencia) return false
  const res = resultado.replace(',', '.')
  const num = parseFloat(res)
  if (isNaN(num)) return false

  // "< X" — should be below
  const ltMatch = referencia.match(/^[<＜]\s*([\d.]+)/)
  if (ltMatch) return num >= parseFloat(ltMatch[1])

  // "> X" — should be above
  const gtMatch = referencia.match(/^[>＞]\s*([\d.]+)/)
  if (gtMatch) return num <= parseFloat(gtMatch[1])

  // "X–Y" or "X-Y" range
  const rangeMatch = referencia.match(/([\d.]+)\s*[–\-]\s*([\d.]+)/)
  if (rangeMatch) {
    const lo = parseFloat(rangeMatch[1])
    const hi = parseFloat(rangeMatch[2])
    return num < lo || num > hi
  }

  return false
}

export default async function ExamesPage() {
  const exams = await prisma.exam.findMany({
    orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
  })

  const byCategory = new Map<string, typeof exams>()
  for (const e of exams) {
    if (!byCategory.has(e.categoria)) byCategory.set(e.categoria, [])
    byCategory.get(e.categoria)!.push(e)
  }

  const dataColeta = exams[0]?.dataColeta
  const dateLabel = dataColeta
    ? new Date(dataColeta).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'

  const categorias = CATEGORIA_ORDER.filter((c) => byCategory.has(c))
  const extra = Array.from(byCategory.keys()).filter((c) => !CATEGORIA_ORDER.includes(c))

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur px-5 pt-10 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/treino" className="text-gray-400 text-xl">‹</Link>
          <div>
            <h1 className="text-xl font-bold">Exames</h1>
            <p className="text-gray-400 text-xs">Coleta: {dateLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {[...categorias, ...extra].map((cat) => {
          const items = byCategory.get(cat)!
          return (
            <div key={cat}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {CATEGORIA_LABEL[cat] ?? cat}
              </h2>
              <div className="bg-gray-800 rounded-2xl divide-y divide-gray-700">
                {items.map((e) => {
                  const out = isOutOfRange(e.resultado, e.referencia)
                  const val = e.unidade ? `${e.resultado} ${e.unidade}` : e.resultado
                  return (
                    <div key={e.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{e.nome}</p>
                        {e.referencia && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-tight">ref: {e.referencia}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-sm font-semibold ${
                            out ? 'text-amber-400' : 'text-green-400'
                          }`}
                        >
                          {val}
                        </span>
                        {out && (
                          <p className="text-xs text-amber-500 mt-0.5">⚠ fora da ref</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

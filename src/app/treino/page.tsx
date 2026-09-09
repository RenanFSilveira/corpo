// TODO (Dev Frontend — Fase 2): implement workout selection and logging UI
export default function TreinoPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center pt-8">
        <div className="text-5xl mb-4">💪</div>
        <h1 className="text-2xl font-bold">Meu Corpo</h1>
        <p className="text-gray-400 mt-2">Fundação pronta — UI em desenvolvimento</p>
      </div>
      <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Status da Fase 1</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Next.js App Router + TypeScript + Tailwind</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Prisma + Postgres schema</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Auth via senha (middleware)</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Seed com 23 exames + A/B/C templates</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> PWA (manifest + icons + service worker)</li>
        </ul>
      </div>
    </div>
  )
}

'use client'

export default function SnapshotButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <a
        href="/api/snapshot?format=md"
        download
        className="flex flex-col items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-center active:scale-95 transition-transform"
      >
        <span className="text-2xl">📄</span>
        <span className="text-sm font-semibold">Markdown</span>
        <span className="text-xs text-gray-500">snapshot.md</span>
      </a>
      <a
        href="/api/snapshot?format=json"
        download
        className="flex flex-col items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-center active:scale-95 transition-transform"
      >
        <span className="text-2xl">🗂️</span>
        <span className="text-sm font-semibold">JSON</span>
        <span className="text-xs text-gray-500">snapshot.json</span>
      </a>
    </div>
  )
}

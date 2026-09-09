'use client'

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts'

type Point = { date: string; maxPeso: number | null }

export default function MiniChart({ data }: { data: Point[] }) {
  const filtered = data.filter((d) => d.maxPeso != null)
  if (filtered.length < 2) return null

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={filtered} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
        <YAxis domain={['auto', 'auto']} hide />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as Point
            return (
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow">
                {d.maxPeso}kg
              </div>
            )
          }}
        />
        <Line
          type="monotone"
          dataKey="maxPeso"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: '#16a34a' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

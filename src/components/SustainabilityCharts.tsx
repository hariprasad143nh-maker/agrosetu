"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { name: "Jan", recovered: 12 },
  { name: "Feb", recovered: 19 },
  { name: "Mar", recovered: 15 },
  { name: "Apr", recovered: 22 },
  { name: "May", recovered: 28 },
  { name: "Jun", recovered: 35 },
]

export function RecoveryChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <Tooltip 
          cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="recovered" fill="#16a34a" radius={[4, 4, 0, 0]} name="Recovered (Tons)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

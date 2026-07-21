"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SalesChart({ data }: { data: { month: string; revenue: number; bookings: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5decb" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a8578" }} />
        <YAxis tick={{ fontSize: 12, fill: "#7a8578" }} />
        <Tooltip
          formatter={(value, name) =>
            name === "revenue"
              ? [new Intl.NumberFormat("th-TH").format(Number(value)) + " บาท", "รายได้"]
              : [String(value), "จำนวนการจอง"]
          }
          contentStyle={{ borderRadius: 12, border: "1px solid #e5decb", fontSize: 13 }}
        />
        <Bar dataKey="revenue" fill="#0f4c42" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

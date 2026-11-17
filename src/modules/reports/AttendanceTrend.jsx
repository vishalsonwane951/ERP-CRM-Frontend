import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../api/index.js';
import { Spinner, ErrorNote } from '../../components/ui.jsx';
import { fmtDate } from '../../lib/format.js';

export default function AttendanceTrend({ days = 14, height = 240 }) {
  const q = useQuery({ queryKey: ['att-trend', days], queryFn: () => api.reports.trend(days) });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const rows = q.data.filter((d) => ![0, 6].includes(new Date(`${d.date}T00:00:00Z`).getUTCDay()));
  return (
    <div style={{ height }} className="text-ink px-2 pb-3 pt-4">
      <ResponsiveContainer>
        <BarChart data={rows} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.12} />
          <XAxis dataKey="date" tickFormatter={(d) => fmtDate(d, { day: 'numeric', month: 'short' })} tick={{ fontSize: 12, fill: '#8d93b8' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8d93b8' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip cursor={{ fill: 'rgba(108,92,231,.08)' }} labelFormatter={(d) => fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })} contentStyle={{ borderRadius: 10, border: '1px solid rgb(var(--line))', background: 'rgb(var(--surface))', color: 'rgb(var(--ink))', fontSize: 13 }} />
          <Bar dataKey="present" name="On time" stackId="a" fill="#12b76a" />
          <Bar dataKey="late" name="Late" stackId="a" fill="#f79009" />
          <Bar dataKey="halfDay" name="Half day" stackId="a" fill="#f04438" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

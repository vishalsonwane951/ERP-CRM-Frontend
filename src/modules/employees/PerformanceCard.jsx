import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../api/index.js';
import { Badge, Button, Card, CardHeader, ErrorNote, Spinner } from '../../components/ui.jsx';
import { monthLabel, shiftMonth, todayISO } from '../../lib/format.js';

export const BAND_TONE = { Excellent: 'moss', Good: 'teal', 'Needs attention': 'saffron', 'At risk': 'lotus' };
const pct = (x) => (x == null ? 'Nothing to measure' : `${Math.round(x * 100)}%`);

/** Score of the month (tasks, attendance, leave) and the last six months. The formula lives in backend/services/performance.js. */
export default function PerformanceCard({ id }) {
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const q = useQuery({ queryKey: ['performance', id, month], queryFn: () => api.employees.performance(id, month) });
  const c = q.data?.components;
  return (
    <Card>
      <CardHeader title="Performance" sub="Built from tasks done on time, attendance and leave." action={
        <div className="flex items-center gap-1"><Button size="sm" variant="secondary" onClick={() => setMonth(shiftMonth(month, -1))}>Previous</Button><span className="px-2 text-[14px] font-semibold">{monthLabel(month)}</span>
          <Button size="sm" variant="secondary" disabled={month >= todayISO().slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}>Next</Button></div>} />
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : (
        <div className="grid gap-6 p-5 lg:grid-cols-[240px_1fr]">
          <div>
            <p className="text-[56px] font-bold leading-none tabular-nums">{q.data.score ?? '–'}<span className="text-[18px] text-mute"> / 100</span></p>
            {q.data.label && <div className="mt-3"><Badge tone={BAND_TONE[q.data.label]}>{q.data.label}</Badge></div>}
            {c?.tasks && (
              <dl className="mt-5 space-y-2 text-[13.5px]">
                <div><dt className="text-mute">Tasks on time</dt><dd className="font-medium">{c.tasks.due ? `${c.tasks.onTime} of ${c.tasks.due}${c.tasks.doneLate ? ` (${c.tasks.doneLate} done late)` : ''}` : 'No tasks were due'}</dd></div>
                <div><dt className="text-mute">Attendance</dt><dd className="font-medium">{pct(c.attendance.score)}: {c.attendance.present} on time, {c.attendance.late} late, {c.attendance.halfDay} half, {c.attendance.absent} absent</dd></div>
                <div><dt className="text-mute">Leave taken</dt><dd className="font-medium">{c.leaves.days} {c.leaves.days === 1 ? 'day' : 'days'}</dd></div>
              </dl>
            )}
          </div>
          <div className="h-[220px]" aria-label="Score for the last six months">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={q.data.trend.map((t) => ({ name: monthLabel(t.month).slice(0, 3), score: t.score ?? 0 }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tickLine={false} /><YAxis domain={[0, 100]} width={32} tickLine={false} />
                <Tooltip formatter={(v) => [`${v} / 100`, 'Score']} /><Bar dataKey="score" fill="#6c5ce7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}

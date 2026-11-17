import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { Badge, Button, Card, Empty, ErrorNote, PageHeader, Spinner } from '../../components/ui.jsx';
import { monthLabel, shiftMonth, todayISO } from '../../lib/format.js';
import { BAND_TONE } from '../employees/PerformanceCard.jsx';

/** One row per person the viewer may see: HR sees everyone, a manager his team. Click a person for the detail and the trend. */
export default function PerformancePage() {
  const nav = useNavigate();
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const q = useQuery({ queryKey: ['team-performance', month], queryFn: () => api.employees.teamPerformance(month) });
  return (
    <>
      <PageHeader title="Performance" sub="Tasks on time, attendance and leave, scored out of 100." actions={
        <div className="flex items-center gap-1"><Button size="sm" variant="secondary" onClick={() => setMonth(shiftMonth(month, -1))}>Previous</Button><span className="px-2 text-[14px] font-semibold">{monthLabel(month)}</span>
          <Button size="sm" variant="secondary" disabled={month >= todayISO().slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}>Next</Button></div>} />
      <Card>
        {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.rows.length ? <Empty title="No one to show" /> : (
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Person</th><th className="text-right">Score</th><th>Rating</th><th className="text-right">Tasks on time</th><th className="text-right">Late days</th><th className="text-right">Absent days</th><th className="text-right">Leave days</th></tr></thead>
            <tbody>{q.data.rows.map((r) => (
              <tr key={r.empId} className="row-click" onClick={() => nav(`/people/${r.empId}`)}>
                <td><p className="font-semibold">{r.name}</p><p className="text-[12.5px] text-mute">{r.designation}</p></td>
                <td className="text-right text-[16px] font-bold tabular-nums">{r.score ?? '–'}</td>
                <td>{r.label ? <Badge tone={BAND_TONE[r.label]}>{r.label}</Badge> : '–'}</td>
                <td className="text-right tabular-nums">{r.tasksDue ? `${r.tasksOnTime} of ${r.tasksDue}` : '–'}</td>
                <td className="text-right tabular-nums">{r.lateDays ?? '–'}</td><td className="text-right tabular-nums">{r.absentDays ?? '–'}</td><td className="text-right tabular-nums">{r.leaveDays ?? '–'}</td>
              </tr>))}
            </tbody></table></div>
        )}
      </Card>
    </>
  );
}

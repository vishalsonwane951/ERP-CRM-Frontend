import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, Button, Card, Empty, ErrorNote, Input, PageHeader, Spinner, StatusBadge, Tabs } from '../../components/ui.jsx';
import MonthCalendar from './MonthCalendar.jsx';
import { ATT_STATUS, fmtTime, hm, monthLabel, shiftMonth, todayISO } from '../../lib/format.js';

function MyMonth({ tz }) {
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const q = useQuery({ queryKey: ['att-mine', month], queryFn: () => api.attendance.mine(month) });
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-[18px] font-semibold">{monthLabel(month)}</h2>
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="secondary" size="sm" disabled={month >= todayISO().slice(0, 7)} aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : <MonthCalendar month={month} data={q.data} tz={tz} />}
    </Card>
  );
}

function TeamDay({ tz, scopeLabel }) {
  const [date, setDate] = useState(todayISO());
  const q = useQuery({ queryKey: ['att-org', date], queryFn: () => api.attendance.org(date) });
  const c = q.data?.counts;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div><h2 className="text-[18px] font-semibold">{scopeLabel}</h2>{c && <p className="mt-0.5 text-[13.5px] text-mute">{c.present + c.halfDay + c.late} of {c.total} checked in</p>}</div>
        <Input type="date" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} className="input !w-auto" aria-label="Date" />
      </div>
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.rows.length ? <Empty icon={Users} title="No one to show" hint="Nobody reports to you yet." /> : (
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Person</th><th>Status</th><th>In</th><th>Out</th><th className="text-right">Worked</th></tr></thead>
            <tbody>
              {q.data.rows.map((r) => (
                <tr key={r.empId}>
                  <td><div className="flex items-center gap-3"><Avatar name={r.name} size={32} /><div><p className="font-semibold">{r.name}</p><p className="text-[12.5px] text-mute">{r.designation}</p></div></div></td>
                  <td><StatusBadge map={ATT_STATUS} value={r.status} />{r.lateByMinutes > 10 && r.status !== 'PRESENT' && <span className="ml-2 text-[12.5px] text-mute">{r.lateByMinutes}m</span>}</td>
                  <td>{fmtTime(r.checkInAt, tz)}</td><td>{fmtTime(r.checkOutAt, tz)}</td><td className="text-right tabular-nums">{hm(r.workedMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function AttendancePage() {
  const { user, is } = useAuth();
  const canTeam = is('MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR');
  const [tab, setTab] = useState('mine');
  const tz = user.timezone;
  return (
    <>
      <PageHeader title="Attendance" sub="Your check-ins, and who is in today."
        actions={canTeam && <Tabs value={tab} onChange={setTab} tabs={[{ id: 'mine', label: 'My month' }, { id: 'team', label: user.role === 'MANAGER' ? 'My team' : 'Everyone' }]} />} />
      {tab === 'mine' ? <MyMonth tz={tz} /> : <TeamDay tz={tz} scopeLabel={user.role === 'MANAGER' ? 'My team' : 'Company'} />}
    </>
  );
}

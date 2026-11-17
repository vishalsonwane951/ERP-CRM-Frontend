import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Users } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, Badge, Card, Empty, ErrorNote, PageHeader, Spinner, cx } from '../../components/ui.jsx';
import { fmtDate, fmtTime } from '../../lib/format.js';
import EmployeeDrill from './EmployeeDrill.jsx';

export const TODAY = {
  PRESENT: { label: 'In, on time', tone: 'moss' }, LATE: { label: 'In, late', tone: 'saffron' }, HALF_DAY: { label: 'Half day', tone: 'saffron' },
  ON_LEAVE: { label: 'On leave', tone: 'teal' }, NOT_IN: { label: 'Not in yet', tone: 'lotus' },
};

const Chip = ({ n, label, tone }) => (
  <div className="rounded-ctl bg-paper px-3 py-2 text-center">
    <p className={cx('text-[20px] font-bold tabular-nums', tone === 'moss' && 'text-moss-600', tone === 'saffron' && 'text-saffron-600', tone === 'lotus' && n > 0 && 'text-lotus-600')}>{n}</p>
    <p className="text-[12px] text-mute">{label}</p>
  </div>
);

function Group({ g, onPick }) {
  const [open, setOpen] = useState(false);
  const a = g.attendance;
  const pct = g.tasks.total ? Math.round((g.tasks.done / g.tasks.total) * 100) : 0;
  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <Avatar name={g.lead?.name || 'Direct'} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold">{g.lead ? g.lead.name : 'Reporting to you directly'}</p>
          <p className="text-[13px] text-mute">{g.lead ? `Project manager · ` : ''}{g.size} {g.size === 1 ? 'person' : 'people'}</p>
        </div>
        <ChevronDown className={cx('h-5 w-5 text-mute transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <div className="grid grid-cols-2 gap-2 px-5 pb-4 sm:grid-cols-4">
        <Chip n={a.present + a.halfDay} label="In today" tone="moss" />
        <Chip n={a.late} label="Late" tone="saffron" />
        <Chip n={a.onLeave} label="On leave" />
        <Chip n={a.notIn} label="Not in yet" tone="lotus" />
      </div>
      <div className="border-t border-line px-5 py-3.5">
        <div className="mb-1.5 flex items-center justify-between text-[13px]"><span className="font-semibold">Task progress</span>
          <span className="text-mute">{g.tasks.done} of {g.tasks.total} done{g.tasks.overdue > 0 && <span className="ml-2 font-semibold text-lotus-600">{g.tasks.overdue} overdue</span>}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-moss-600" style={{ width: `${pct}%` }} /></div>
      </div>
      {open && (
        <div className="overflow-x-auto border-t border-line">
          <table className="tbl"><thead><tr><th>Person</th><th>Today</th><th>Check-in</th><th className="text-right">Open tasks</th></tr></thead>
            <tbody>{g.members.map((m) => (
              <tr key={m.empId} className="row-click" onClick={() => onPick(m)}>
                <td><p className="font-semibold">{m.name}</p><p className="text-[12.5px] text-mute">{m.designation}</p></td>
                <td><Badge tone={TODAY[m.today].tone}>{TODAY[m.today].label}</Badge></td>
                <td className="text-mute">{fmtTime(m.checkInAt)}</td>
                <td className="text-right tabular-nums">{m.tasks.open}{m.tasks.overdue > 0 && <span className="ml-1.5 text-[12.5px] font-semibold text-lotus-600">({m.tasks.overdue} late)</span>}</td>
              </tr>))}
            </tbody></table>
        </div>
      )}
    </Card>
  );
}

/** For a MANAGER: one card per project manager. For a PROJECT_MANAGER: his own team. Click a person to see attendance, leave and tasks. */
export default function TeamDashboard() {
  const { user } = useAuth();
  const q = useQuery({ queryKey: ['team-overview'], queryFn: api.team.overview, refetchInterval: 120_000 });
  const [pick, setPick] = useState(null);
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const { date, groups } = q.data;
  return (
    <>
      <PageHeader title="My team" sub={`${fmtDate(date)}. ${user.role === 'MANAGER' ? 'Each project manager and their people.' : 'The people on your projects.'}`} />
      {!groups.length ? <Card><Empty icon={Users} title="No one reports to you yet" hint="People appear here once HR sets you as their manager." /></Card> : (
        <div className="space-y-5">{groups.map((g) => <Group key={g.lead?.empId || 'direct'} g={g} onPick={setPick} />)}</div>
      )}
      {pick && <EmployeeDrill person={pick} onClose={() => setPick(null)} />}
    </>
  );
}

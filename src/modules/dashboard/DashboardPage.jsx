import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PunchCard from '../attendance/PunchCard.jsx';
<<<<<<< HEAD
=======
import TodayTasks from '../projects/TodayTasks.jsx';
>>>>>>> recovery-master
import AttendanceTrend from '../reports/AttendanceTrend.jsx';
import { Avatar, Card, CardHeader, Stat } from '../../components/ui.jsx';
import { greeting, localMinutes } from '../../lib/format.js';

function LeaveGlance() {
  const q = useQuery({ queryKey: ['leave-me'], queryFn: api.leaves.me });
  return (
    <Card>
      <CardHeader title="Your leave" action={<Link to="/leave" className="text-[13.5px] font-semibold text-peacock-700 hover:underline">Request leave</Link>} />
      <div className="space-y-4 p-5">
        {!q.data && <div className="h-24 animate-pulse rounded-ctl bg-paper" />}
        {q.data?.balances.map((b) => (
          <div key={b.typeId}>
            <div className="flex items-baseline justify-between text-[14px]"><span className="font-medium">{b.name}</span><span className="text-mute"><b className="text-ink">{b.available}</b> of {b.total} days left</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper"><div className="h-full rounded-full" style={{ width: `${((b.used + b.pending) / b.total) * 100}%`, background: b.color }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WaitingOnYou() {
  const q = useQuery({ queryKey: ['approvals-pending'], queryFn: api.approvals.pending });
  if (!q.data?.length) return null;
  return (
    <Card>
      <CardHeader title="Waiting on you" sub={`${q.data.length} request${q.data.length > 1 ? 's' : ''} to decide`} />
      <ul>
        {q.data.slice(0, 4).map((a) => (
          <li key={a.reqId} className="border-b border-line/70 last:border-0">
            <Link to={`/approvals?open=${a.reqId}`} className="flex items-center gap-3 px-5 py-3 hover:bg-paper">
              <Avatar name={a.requesterName} size={32} />
              <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold">{a.requesterName}</p><p className="truncate text-[13px] text-mute">{a.summary}</p></div>
              <ChevronRight className="h-4 w-4 text-mute" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function DashboardPage() {
<<<<<<< HEAD
  const { user } = useAuth();
=======
  const { user, has } = useAuth();
>>>>>>> recovery-master
  const dash = useQuery({ queryKey: ['dashboard'], queryFn: api.reports.dashboard, refetchInterval: 60_000 });
  const d = dash.data;
  const first = user.name.split(' ')[0];
  const scopeWord = d?.scope === 'team' ? 'Your team' : 'The company';

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[24px] font-bold leading-tight">{greeting(localMinutes(Date.now(), user.timezone))}, {first}</h1>
        <p className="mt-1 text-[14px] text-mute">{user.designation}, {user.orgName}</p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <PunchCard />
        <div className="space-y-5"><WaitingOnYou /><LeaveGlance /></div>
      </div>

<<<<<<< HEAD
=======
      {has('projects') && <div className="mt-5"><TodayTasks /></div>}

>>>>>>> recovery-master
      {d && d.scope !== 'self' && (
        <div className="mt-5 grid gap-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat hero label={`${scopeWord} today`} value={d.headcount} sub="active people" />
            <Stat label="Checked in" value={d.present + d.late} tone="moss" sub={`${d.present} on time`} />
            <Stat label="Late" value={d.late} tone={d.late ? 'saffron' : undefined} sub="past the grace period" />
            <Stat label="Not in" value={d.absent} tone={d.absent ? 'lotus' : undefined} sub={d.openRequests != null ? `${d.openRequests} open requests` : 'absent or not yet in'} />
          </div>
          {d.scope === 'org' && (
            <Card>
              <CardHeader title="Attendance, last two weeks" sub="Weekdays only" action={<Link to="/reports" className="text-[13.5px] font-semibold text-peacock-700 hover:underline">All reports</Link>} />
              <AttendanceTrend days={14} />
            </Card>
          )}
        </div>
      )}
    </>
  );
}

import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { Badge, Card, CardHeader, ErrorNote, Spinner } from '../../components/ui.jsx';
import { fmtDate, money } from '../../lib/format.js';

/** "My salary so far": the current pay cycle, up to today, line by line. An estimate, never a payslip. */
export default function MySalaryCard() {
  const q = useQuery({ queryKey: ['my-estimate'], queryFn: api.payroll.myEstimate });
  if (q.isLoading) return <Card className="mt-5"><Spinner /></Card>;
  if (q.error) return <Card className="mt-5"><ErrorNote error={q.error} retry={q.refetch} /></Card>;
  const { label, cycle, days, lines } = q.data;
  return (
    <Card className="mt-5">
      <CardHeader title="My salary so far" sub={`Pay cycle ${fmtDate(cycle.from)} to ${fmtDate(cycle.to)}. Counted up to ${fmtDate(cycle.asOf)}.`} action={<Badge tone="saffron">{label}</Badge>} />
      <div className="grid gap-8 p-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-1 text-[15px] font-semibold">Days counted</h3>
          {days.map((d) => <div key={d.label} className="flex justify-between border-b border-line/70 py-2 text-[14px]"><span className="text-mute">{d.label}</span><span className="font-medium tabular-nums">{d.value}</span></div>)}
        </div>
        <div>
          <h3 className="mb-1 text-[15px] font-semibold">How the amount comes out</h3>
          {lines.map((l) => (
            <div key={l.label} className={`flex justify-between py-2 text-[14px] ${l.kind === 'total' ? 'border-t border-ink font-bold' : 'border-b border-line/70'}`}>
              <span className={l.kind === 'total' ? '' : 'text-mute'}>{l.label}</span>
              <span className={`tabular-nums ${l.kind === 'deduct' ? 'text-lotus-600' : ''}`}>{l.amount < 0 ? `- ${money(-l.amount)}` : money(l.amount)}</span>
            </div>
          ))}
          <p className="mt-3 text-[12.5px] text-mute">Absent days and without-pay leave reduce your pay. Holidays and paid leave do not. Final figures come with your payslip after payroll is run.</p>
        </div>
      </div>
    </Card>
  );
}

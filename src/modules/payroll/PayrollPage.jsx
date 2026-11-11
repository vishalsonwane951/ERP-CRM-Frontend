import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calculator, Lock, Plus } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, CardHeader, Empty, ErrorNote, Field, Input, Modal, PageHeader, Spinner, useToast, cx } from '../../components/ui.jsx';
import { PayslipView } from './PayslipsPage.jsx';
import { fmtDateTime, money, monthLabel } from '../../lib/format.js';

const TONE = { DRAFT: 'neutral', PROCESSING: 'saffron', FINALIZED: 'moss' };
const LABEL = { DRAFT: 'Draft', PROCESSING: 'Calculated', FINALIZED: 'Locked' };

function RunDetail({ period }) {
  const { user, is } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const [slip, setSlip] = useState(null);
  const q = useQuery({ queryKey: ['pay-lines', period], queryFn: () => api.payroll.lines(period) });
  const done = (msg) => () => { ['pay-runs', 'pay-lines'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success(msg); };
  const proc = useMutation({ mutationFn: () => api.payroll.process(period), onSuccess: done('Payroll calculated from attendance and leave.'), onError: (e) => toast.error(e.message) });
  const fin = useMutation({ mutationFn: () => api.payroll.finalize(period), onSuccess: done('Payroll locked. Payslips are now visible to employees.'), onError: (e) => toast.error(e.message) });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const { run, lines } = q.data;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div><div className="flex items-center gap-2.5"><h2 className="text-[20px] font-semibold">{monthLabel(period)}</h2><Badge tone={TONE[run.status]}>{LABEL[run.status]}</Badge></div>
          <p className="mt-0.5 text-[13.5px] text-mute">{run.status === 'FINALIZED' ? `Locked by ${run.finalizedBy}, ${fmtDateTime(run.finalizedAt)}` : `Started by ${run.createdBy}`}</p></div>
        <div className="flex gap-2">
          {run.status !== 'FINALIZED' && is('HR_ADMIN', 'FINANCE') && <Button variant="secondary" icon={Calculator} loading={proc.isPending} onClick={() => proc.mutate()}>{run.status === 'DRAFT' ? 'Calculate' : 'Recalculate'}</Button>}
          {run.status === 'PROCESSING' && is('FINANCE') && <Button icon={Lock} loading={fin.isPending} onClick={() => window.confirm(`Lock payroll for ${monthLabel(period)}? Locked runs cannot be changed.`) && fin.mutate()}>Lock run</Button>}
        </div>
      </div>
      <div className="grid grid-cols-3 border-b border-line [&>div]:border-r [&>div]:border-line [&>div:last-child]:border-r-0">
        {[['People paid', run.employeeCount], ['Total gross', money(run.totalGross)], ['Total net', money(run.totalNet)]].map(([l, v]) => <div key={l} className="px-5 py-3.5"><p className="text-[13px] text-mute">{l}</p><p className="font-display text-[24px] font-semibold tabular-nums">{v}</p></div>)}
      </div>
      {!lines.length ? <Empty icon={Calculator} title="Nothing calculated yet" hint="Calculate to pull in attendance and approved leave for every active person." /> : (
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Person</th><th className="text-right">Gross</th><th className="text-right">Loss of pay</th><th className="text-right">Deductions</th><th className="text-right">Net</th></tr></thead>
          <tbody>{lines.map((l) => <tr key={l.empId} className="row-click" onClick={() => setSlip(l)}><td><p className="font-semibold">{l.name}</p><p className="text-[12.5px] text-mute">{l.designation}</p></td><td className="text-right tabular-nums">{money(l.gross)}</td><td className={cx('text-right tabular-nums', l.lopDays > 0 && 'text-lotus-600')}>{l.lopDays > 0 ? `${l.lopDays}d · ${money(l.lopAmount)}` : '–'}</td><td className="text-right tabular-nums">{money(l.deductions)}</td><td className="text-right font-semibold tabular-nums">{money(l.net)}</td></tr>)}</tbody></table></div>
      )}
      <Modal open={!!slip} onClose={() => setSlip(null)} title="Payslip preview" size="lg">{slip && <PayslipView line={slip} org={user.orgName} />}</Modal>
    </>
  );
}

export default function PayrollPage() {
  const { is } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const [sel, setSel] = useState(null); const [adding, setAdding] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const runs = useQuery({ queryKey: ['pay-runs'], queryFn: api.payroll.runs });
  const create = useMutation({ mutationFn: () => api.payroll.create(period), onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['pay-runs'] }); setSel(r.period); setAdding(false); toast.success('Payroll run started.'); }, onError: (e) => toast.error(e.message) });
  const active = sel || runs.data?.[0]?.period;
  return (
    <>
      <PageHeader title="Payroll" sub="Calculate each month from attendance and leave, then lock it." actions={is('HR_ADMIN', 'FINANCE') && <Button icon={Plus} onClick={() => setAdding(true)}>Start a run</Button>} />
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="self-start overflow-hidden">
          {runs.isLoading ? <Spinner /> : runs.error ? <ErrorNote error={runs.error} retry={runs.refetch} /> : !runs.data.length ? <Empty title="No runs yet" /> : (
            <ul>{runs.data.map((r) => (
              <li key={r.period} className="border-b border-line/70 last:border-0"><button onClick={() => setSel(r.period)} className={cx('flex w-full items-center justify-between px-4 py-3 text-left hover:bg-paper', active === r.period && 'bg-peacock-50')}><span className="font-semibold">{monthLabel(r.period)}</span><Badge tone={TONE[r.status]} dot={false}>{LABEL[r.status]}</Badge></button></li>))}
            </ul>
          )}
        </Card>
        <Card>{active ? <RunDetail key={active} period={active} /> : <Empty title="Select a run" hint="Start a run to calculate this month's pay." />}</Card>
      </div>
      <Modal open={adding} onClose={() => setAdding(false)} title="Start a payroll run" size="sm" footer={<><Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button><Button loading={create.isPending} onClick={() => create.mutate()}>Start run</Button></>}>
        <Field label="Month"><Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} /></Field>
      </Modal>
    </>
  );
}

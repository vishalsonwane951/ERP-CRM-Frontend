import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
<<<<<<< HEAD
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
=======
import { Calculator, Check, Mail, Plus, RotateCcw, Send, Wallet } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Modal, PageHeader, Spinner, Textarea, useToast, cx } from '../../components/ui.jsx';
import { PayslipView } from './PayslipsPage.jsx';
import { fmtDate, fmtDateTime, money, monthLabel, todayISO } from '../../lib/format.js';

// The run goes DRAFT > CALCULATED > SUBMITTED > APPROVED > PAID > PAYSLIPS_SENT (RETURNED sends it back to HR). Rules are enforced by the API.
const RUN = {
  DRAFT: { label: 'Draft', tone: 'neutral' }, CALCULATED: { label: 'Calculated', tone: 'saffron' }, SUBMITTED: { label: 'With Finance', tone: 'teal' },
  RETURNED: { label: 'Returned to HR', tone: 'lotus' }, APPROVED: { label: 'Approved', tone: 'teal' }, PAID: { label: 'Paid', tone: 'moss' }, PAYSLIPS_SENT: { label: 'Payslips sent', tone: 'moss' },
};
const PAY = { PENDING: { label: 'Not paid', tone: 'neutral' }, PAID: { label: 'Paid', tone: 'moss' }, FAILED: { label: 'Failed', tone: 'lotus' }, ON_HOLD: { label: 'On hold', tone: 'saffron' } };
const STEPS = ['CALCULATED', 'SUBMITTED', 'APPROVED', 'PAID', 'PAYSLIPS_SENT'];
const stepIndex = (status) => (status === 'RETURNED' ? 0 : status === 'DRAFT' ? -1 : STEPS.indexOf(status));

function Stepper({ status }) {
  const now = stepIndex(status);
  return (
    <ol className="flex flex-wrap gap-2 border-b border-line px-5 py-3" aria-label="Payroll progress">
      {STEPS.map((s, i) => (
        <li key={s} className={cx('rounded-full px-3 py-1 text-[12.5px] font-semibold', i < now && 'bg-moss-50 text-moss-700', i === now && 'bg-peacock-600 text-white', i > now && 'bg-ink/5 text-mute')}>{i < now && '✓ '}{RUN[s].label}</li>
      ))}
    </ol>
  );
}

// Finance records a payment for one or many people: PAID needs the bank's transaction reference
function PayModal({ period, empIds, all, count, onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const [f, setF] = useState({ payStatus: 'PAID', transactionRef: '', paidOn: todayISO(), note: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = useMutation({
    mutationFn: () => api.payroll.pay(period, { ...(all ? { all: true } : { empIds }), ...f }),
    onSuccess: (r) => { toast.success(r.run.status === 'PAID' ? 'Everyone is paid. HR can now send the payslips.' : `${r.updated} updated.`); ['pay-runs', 'pay-lines'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title="Record payment" sub={`${count} ${count === 1 ? 'person' : 'people'}`} size="sm"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={f.payStatus === 'PAID' && !f.transactionRef.trim()} onClick={() => save.mutate()}>Save</Button></>}>
      <div className="space-y-4">
        <Field label="Result"><div className="flex gap-2">{['PAID', 'FAILED', 'ON_HOLD'].map((s) => <button key={s} onClick={() => setF((x) => ({ ...x, payStatus: s }))} className={cx('flex-1 rounded-ctl border px-3 py-2 text-[13.5px] font-semibold', f.payStatus === s ? 'border-peacock-600 bg-peacock-50 text-peacock-700' : 'border-line text-mute')}>{PAY[s].label}</button>)}</div></Field>
        {f.payStatus === 'PAID' ? (
          <>
            <Field label="Transaction reference" hint="From the bank, for example the NEFT or UTR number."><Input value={f.transactionRef} onChange={set('transactionRef')} /></Field>
            <Field label="Paid on"><Input type="date" max={todayISO()} value={f.paidOn} onChange={set('paidOn')} /></Field>
          </>
        ) : <Field label="Note for HR (optional)"><Textarea value={f.note} onChange={set('note')} maxLength={200} /></Field>}
      </div>
    </Modal>
  );
}

function ReturnModal({ period, onClose }) {
  const toast = useToast(); const qc = useQueryClient(); const [reason, setReason] = useState('');
  const save = useMutation({ mutationFn: () => api.payroll.returnRun(period, reason), onSuccess: () => { toast.success('Returned to HR.'); ['pay-runs', 'pay-lines'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); onClose(); }, onError: (e) => toast.error(e.message) });
  return (
    <Modal open onClose={onClose} title="Return to HR" sub="HR will see your reason, fix the run and submit it again." size="sm"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" loading={save.isPending} disabled={reason.trim().length < 3} onClick={() => save.mutate()}>Return</Button></>}>
      <Field label="Reason (required)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} /></Field>
    </Modal>
  );
}

function RunDetail({ period }) {
  const { user, is } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const [slip, setSlip] = useState(null); const [paying, setPaying] = useState(null); const [returning, setReturning] = useState(false);
  const [picked, setPicked] = useState(new Set());
  const q = useQuery({ queryKey: ['pay-lines', period], queryFn: () => api.payroll.lines(period) });
  const refresh = () => ['pay-runs', 'pay-lines'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const step = (fn, msg) => useMutation({ mutationFn: fn, onSuccess: () => { refresh(); toast.success(msg); }, onError: (e) => toast.error(e.message) }); // eslint-disable-line react-hooks/rules-of-hooks
  const calc = step(() => api.payroll.calculate(period), 'Payroll calculated from attendance and leave.');
  const submit = step(() => api.payroll.submit(period), 'Submitted to Finance. HR cannot change this run until Finance returns it.');
  const approve = step(() => api.payroll.approve(period), 'Approved. Now record the payments.');
  const send = useMutation({
    mutationFn: (empId) => api.payroll.sendPayslips(period, empId),
    onSuccess: (r) => { refresh(); (r.failed ? toast.error : toast.success)(`${r.sent} payslip${r.sent === 1 ? '' : 's'} emailed${r.failed ? `, ${r.failed} failed (see the list)` : ''}.`); },
    onError: (e) => toast.error(e.message),
  });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const { run, lines } = q.data;
  const hr = is('HR_ADMIN'); const fin = is('FINANCE'); const st = run.status;
  const unpaid = lines.filter((l) => l.payStatus !== 'PAID');
  const toggle = (id) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const paidCount = lines.filter((l) => l.payStatus === 'PAID').length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <div className="flex items-center gap-2.5"><h2 className="text-[20px] font-semibold">{monthLabel(period)}</h2><Badge tone={RUN[st].tone}>{RUN[st].label}</Badge></div>
          <p className="mt-0.5 text-[13.5px] text-mute">{run.cycleFrom ? `Pay cycle ${fmtDate(run.cycleFrom)} to ${fmtDate(run.cycleTo)}. ` : ''}{st === 'SUBMITTED' || st === 'APPROVED' || st === 'PAID' || st === 'PAYSLIPS_SENT' ? `Submitted by ${run.submittedBy || '–'}${run.approvedBy ? `, approved by ${run.approvedBy}` : ''}.` : `Started by ${run.createdBy}.`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hr && ['DRAFT', 'CALCULATED', 'RETURNED'].includes(st) && <Button variant="secondary" icon={Calculator} loading={calc.isPending} onClick={() => calc.mutate()}>{st === 'DRAFT' ? 'Calculate' : 'Recalculate'}</Button>}
          {hr && st === 'CALCULATED' && <Button icon={Send} loading={submit.isPending} onClick={() => window.confirm('Submit to Finance? You cannot change this run afterwards unless Finance returns it.') && submit.mutate()}>Submit to Finance</Button>}
          {fin && st === 'SUBMITTED' && <><Button variant="dangerSoft" icon={RotateCcw} onClick={() => setReturning(true)}>Return to HR</Button><Button variant="success" icon={Check} loading={approve.isPending} onClick={() => approve.mutate()}>Approve</Button></>}
          {fin && st === 'APPROVED' && <Button icon={Wallet} disabled={!unpaid.length} onClick={() => setPaying({ all: true, count: unpaid.length })}>Mark all unpaid as paid</Button>}
          {hr && st === 'PAID' && <Button icon={Mail} loading={send.isPending && !send.variables} onClick={() => send.mutate(undefined)}>Generate payslips and email</Button>}
        </div>
      </div>
      <Stepper status={st} />
      {st === 'RETURNED' && <div role="alert" className="border-b border-lotus-100 bg-lotus-50 px-5 py-3 text-[14px] text-lotus-700"><b>Returned by {run.returnedBy}:</b> {run.returnReason}</div>}
      <div className="grid grid-cols-3 border-b border-line [&>div]:border-r [&>div]:border-line [&>div:last-child]:border-r-0">
        {[['People', run.employeeCount], ['Total gross', money(run.totalGross)], [st === 'APPROVED' || st === 'PAID' || st === 'PAYSLIPS_SENT' ? `Paid (${paidCount} of ${lines.length})` : 'Total net', money(st === 'APPROVED' || st === 'PAID' || st === 'PAYSLIPS_SENT' ? lines.filter((l) => l.payStatus === 'PAID').reduce((s, l) => s + l.net, 0) : run.totalNet)]].map(([l, v]) => <div key={l} className="px-5 py-3.5"><p className="text-[13px] text-mute">{l}</p><p className="font-display text-[24px] font-semibold tabular-nums">{v}</p></div>)}
      </div>
      {fin && st === 'APPROVED' && picked.size > 0 && <div className="flex items-center gap-3 border-b border-line bg-peacock-50 px-5 py-2.5 text-[14px]"><b>{picked.size} selected</b><Button size="sm" onClick={() => setPaying({ empIds: [...picked], count: picked.size })}>Record payment</Button><button className="text-mute underline" onClick={() => setPicked(new Set())}>Clear</button></div>}
      {!lines.length ? <Empty icon={Calculator} title="Nothing calculated yet" hint="Calculate to pull in attendance and approved leave for every active person." /> : (
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr>{fin && st === 'APPROVED' && <th className="w-8"><input type="checkbox" aria-label="Select all unpaid" checked={unpaid.length > 0 && picked.size === unpaid.length} onChange={(e) => setPicked(e.target.checked ? new Set(unpaid.map((l) => l.empId)) : new Set())} /></th>}<th>Person</th><th className="text-right">Gross</th><th className="text-right">Loss of pay</th><th className="text-right">Net</th>{['APPROVED', 'PAID', 'PAYSLIPS_SENT'].includes(st) && <><th>Payment</th><th>Payslip</th></>}</tr></thead>
          <tbody>{lines.map((l) => (
            <tr key={l.empId} className="row-click" onClick={() => setSlip(l)}>
              {fin && st === 'APPROVED' && <td onClick={(e) => e.stopPropagation()}>{l.payStatus !== 'PAID' && <input type="checkbox" aria-label={`Select ${l.name}`} checked={picked.has(l.empId)} onChange={() => toggle(l.empId)} />}</td>}
              <td><p className="font-semibold">{l.name}</p><p className="text-[12.5px] text-mute">{l.designation}</p></td>
              <td className="text-right tabular-nums">{money(l.gross)}</td>
              <td className={cx('text-right tabular-nums', l.lopDays > 0 && 'text-lotus-600')}>{l.lopDays > 0 ? `${l.lopDays}d · ${money(l.lopAmount)}` : '–'}</td>
              <td className="text-right font-semibold tabular-nums">{money(l.net)}</td>
              {['APPROVED', 'PAID', 'PAYSLIPS_SENT'].includes(st) && (
                <>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Badge tone={PAY[l.payStatus || 'PENDING'].tone}>{PAY[l.payStatus || 'PENDING'].label}</Badge>
                    {l.transactionRef && <p className="text-[12px] text-mute">{l.transactionRef}{l.paidOn && `, ${fmtDate(l.paidOn)}`}</p>}
                    {l.payNote && <p className="text-[12px] text-mute">{l.payNote}</p>}
                    {fin && st === 'APPROVED' && l.payStatus !== 'PAID' && <button className="mt-1 text-[12.5px] font-semibold text-peacock-700 hover:underline" onClick={() => setPaying({ empIds: [l.empId], count: 1 })}>{l.payStatus === 'FAILED' || l.payStatus === 'ON_HOLD' ? 'Retry' : 'Record'}</button>}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {l.payslipSentAt ? <Badge tone="moss">Sent {fmtDateTime(l.payslipSentAt)}</Badge> : l.emailError ? (
                      <div><p className="max-w-[220px] text-[12px] text-lotus-700">{l.emailError}</p>{hr && st === 'PAID' && <Button size="sm" variant="secondary" loading={send.isPending && send.variables === l.empId} onClick={() => send.mutate(l.empId)}>Retry</Button>}</div>
                    ) : <span className="text-mute">–</span>}
                  </td>
                </>
              )}
            </tr>))}
          </tbody></table></div>
      )}
      <Modal open={!!slip} onClose={() => setSlip(null)} title="Payslip preview" size="lg">{slip && <PayslipView line={slip} org={user.orgName} />}</Modal>
      {paying && <PayModal period={period} {...paying} onClose={() => { setPaying(null); setPicked(new Set()); }} />}
      {returning && <ReturnModal period={period} onClose={() => setReturning(false)} />}
>>>>>>> recovery-master
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
<<<<<<< HEAD
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
=======
  const fin = is('FINANCE') && !is('HR_ADMIN');
  return (
    <>
      <PageHeader title="Payroll" sub={fin ? 'Review what HR submitted, approve it, then record the payments.' : 'Calculate each cycle, send it to Finance, then email the payslips once everyone is paid.'} actions={is('HR_ADMIN') && <Button icon={Plus} onClick={() => setAdding(true)}>Start a run</Button>} />
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="self-start overflow-hidden">
          {runs.isLoading ? <Spinner /> : runs.error ? <ErrorNote error={runs.error} retry={runs.refetch} /> : !runs.data.length ? <Empty title="No runs yet" hint={fin ? 'Runs appear here after HR submits them.' : undefined} /> : (
            <ul>{runs.data.map((r) => (
              <li key={r.period} className="border-b border-line/70 last:border-0"><button onClick={() => setSel(r.period)} className={cx('flex w-full items-center justify-between px-4 py-3 text-left hover:bg-paper', active === r.period && 'bg-peacock-50')}><span className="font-semibold">{monthLabel(r.period)}</span><Badge tone={RUN[r.status].tone} dot={false}>{RUN[r.status].label}</Badge></button></li>))}
            </ul>
          )}
        </Card>
        <Card>{active ? <RunDetail key={active} period={active} /> : <Empty title="Select a run" hint="Start a run to calculate this cycle's pay." />}</Card>
      </div>
      <Modal open={adding} onClose={() => setAdding(false)} title="Start a payroll run" size="sm" footer={<><Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button><Button loading={create.isPending} onClick={() => create.mutate()}>Start run</Button></>}>
        <Field label="Pay period" hint="Named after the month the cycle ends in. The cycle dates come from Settings."><Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} /></Field>
>>>>>>> recovery-master
      </Modal>
    </>
  );
}

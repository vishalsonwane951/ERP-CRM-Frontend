import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plane, Plus } from 'lucide-react';
import { api } from '../../api/index.js';
import { Badge, Button, Card, CardHeader, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, StatusBadge, Textarea, useToast } from '../../components/ui.jsx';
import ApprovalDetail from '../approvals/ApprovalDetail.jsx';
import { REQ_STATUS, fmtDate, todayISO } from '../../lib/format.js';

const weekdays = (from, to) => {
  if (!from || !to || to < from) return 0; let n = 0;
  for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d = new Date(d.getTime() + 864e5)) { const w = d.getUTCDay(); if (w && w !== 6) n++; }
  return n;
};

function ApplyModal({ open, onClose, balances }) {
  const toast = useToast(); const qc = useQueryClient();
  const [f, setF] = useState({ typeId: '', from: todayISO(), to: todayISO(), reason: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value, ...(k === 'from' && e.target.value > s.to ? { to: e.target.value } : {}) }));
  const typeId = f.typeId || balances[0]?.typeId;
  const bal = balances.find((b) => b.typeId === typeId);
  const days = weekdays(f.from, f.to);
  const m = useMutation({
    mutationFn: () => api.leaves.apply({ ...f, typeId, reason: f.reason || undefined }),
    onSuccess: () => { ['leave-me', 'approvals-pending', 'notifs'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success('Leave requested. Your manager has been notified.'); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const over = bal && days > bal.available;
  return (
    <Modal open={open} onClose={onClose} title="Request leave" sub="Weekends are not counted."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={m.isPending} disabled={!days || over} onClick={() => m.mutate()}>Send request</Button></>}>
      <div className="space-y-4">
        <Field label="Type"><Select value={typeId || ''} onChange={set('typeId')}>{balances.map((b) => <option key={b.typeId} value={b.typeId}>{b.name} ({b.available} left)</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="From"><Input type="date" value={f.from} min={todayISO()} onChange={set('from')} /></Field>
          <Field label="To"><Input type="date" value={f.to} min={f.from} onChange={set('to')} /></Field>
        </div>
        <p className={`rounded-ctl px-4 py-3 text-[14px] font-medium ${over ? 'bg-lotus-50 text-lotus-700' : 'bg-peacock-50 text-peacock-800'}`}>
          {days ? `${days} working day${days > 1 ? 's' : ''}` : 'No working days in this range'}{over && ` · you only have ${bal.available} left`}
        </p>
        <Field label="Reason" hint="Optional. Shown to your approvers."><Textarea value={f.reason} onChange={set('reason')} maxLength={500} /></Field>
      </div>
    </Modal>
  );
}

export default function LeavePage() {
  const toast = useToast(); const qc = useQueryClient();
  const [applying, setApplying] = useState(false); const [view, setView] = useState(null);
  const q = useQuery({ queryKey: ['leave-me'], queryFn: api.leaves.me });
  const cancel = useMutation({
    mutationFn: (id) => api.leaves.cancel(id),
    onSuccess: () => { ['leave-me', 'approvals-pending'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success('Request cancelled.'); },
    onError: (e) => toast.error(e.message),
  });
  const upcoming = useMemo(() => (q.data?.requests || []).filter((r) => r.status === 'PENDING').length, [q.data]);

  return (
    <>
      <PageHeader title="Leave" sub={upcoming ? `${upcoming} request${upcoming > 1 ? 's' : ''} waiting for approval` : 'Your balances and requests.'}
        actions={<Button icon={Plus} onClick={() => setApplying(true)} disabled={!q.data}>Request leave</Button>} />
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            {q.data.balances.map((b) => (
              <Card key={b.typeId} className="overflow-hidden">
                <div className="h-1.5" style={{ background: b.color }} />
                <div className="p-5">
                  <p className="text-[14px] font-medium text-mute">{b.name}</p>
                  <p className="mt-1 font-display text-[40px] font-semibold leading-none tabular-nums">{b.available}<span className="ml-1.5 text-[15px] font-medium text-mute">of {b.total} days left</span></p>
                  <p className="mt-3 text-[13px] text-mute">{b.used} taken{b.pending > 0 && `, ${b.pending} waiting for approval`}</p>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader title="My requests" />
            {!q.data.requests.length ? <Empty icon={Plane} title="No leave requests yet" hint="When you request time off it will show up here, with where it is in approval." action={<Button icon={Plus} onClick={() => setApplying(true)}>Request leave</Button>} /> : (
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {q.data.requests.map((r) => (
                      <tr key={r.reqId} className="row-click" onClick={() => setView(r.reqId)}>
                        <td><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: r.color }} />{r.typeName}</td>
                        <td>{fmtDate(r.from)}{r.to !== r.from && ` to ${fmtDate(r.to)}`}</td><td className="tabular-nums">{r.days}</td>
                        <td><StatusBadge map={REQ_STATUS} value={r.status} /></td>
                        <td className="text-right">{r.status === 'PENDING' && <Button variant="ghost" size="sm" loading={cancel.isPending && cancel.variables === r.reqId} onClick={(e) => { e.stopPropagation(); cancel.mutate(r.reqId); }}>Cancel</Button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
      {applying && <ApplyModal open onClose={() => setApplying(false)} balances={q.data?.balances || []} />}
      <Modal open={!!view} onClose={() => setView(null)} title="Request details" side size="md">{view && <ApprovalDetail reqId={view} />}</Modal>
    </>
  );
}

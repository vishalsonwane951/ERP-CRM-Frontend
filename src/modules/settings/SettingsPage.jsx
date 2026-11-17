import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/index.js';
import { Badge, Button, Card, CardHeader, ErrorNote, Field, Input, PageHeader, Select, Spinner, useToast } from '../../components/ui.jsx';
import { fmtDate } from '../../lib/format.js';

// A settings card: shows its fields, and its own Save button that sends only those fields.
function useSave(label) {
  const toast = useToast(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (fields) => api.org.updatePolicy(fields),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org'] }); qc.invalidateQueries({ queryKey: ['att-today'] }); toast.success(`${label} saved.`); },
    onError: (e) => toast.error(e.message),
  });
}

function ShiftCard({ org }) {
  const save = useSave('Shift');
  const [f, setF] = useState({ shiftStart: org.shiftStart, shiftEnd: org.shiftEnd, graceMinutes: org.graceMinutes, halfDayAfterMinutes: org.halfDayAfterMinutes });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  return (
    <Card>
      <CardHeader title="Shift" sub="When people are on time, late, or marked half day." action={<Button loading={save.isPending} onClick={() => save.mutate({ ...f, graceMinutes: Number(f.graceMinutes), halfDayAfterMinutes: Number(f.halfDayAfterMinutes) })}>Save</Button>} />
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Shift starts"><Input type="time" value={f.shiftStart} onChange={set('shiftStart')} /></Field>
        <Field label="Shift ends"><Input type="time" value={f.shiftEnd} onChange={set('shiftEnd')} /></Field>
        <Field label="On time for (minutes)"><Input type="number" min="0" value={f.graceMinutes} onChange={set('graceMinutes')} /></Field>
        <Field label="Half day after (minutes)"><Input type="number" min="0" value={f.halfDayAfterMinutes} onChange={set('halfDayAfterMinutes')} /></Field>
      </div>
    </Card>
  );
}

function BreaksCard({ org }) {
  const save = useSave('Break rules');
  const [f, setF] = useState({ maxBreaksPerDay: org.maxBreaksPerDay ?? 0, breakAllowedAfterMinutes: org.breakAllowedAfterMinutes ?? '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  return (
    <Card>
      <CardHeader title="Breaks" sub="Applies to everyone who checks in. Break time is not counted as working time." action={<Button loading={save.isPending} onClick={() => save.mutate({ maxBreaksPerDay: f.maxBreaksPerDay, breakAllowedAfterMinutes: f.breakAllowedAfterMinutes })}>Save</Button>} />
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Breaks allowed per day" hint="0 turns breaks off."><Input type="number" min="0" max="10" value={f.maxBreaksPerDay} onChange={set('maxBreaksPerDay')} /></Field>
        <Field label="Allowed only after (minutes since check-in)" hint="Leave empty to allow a break at any time between check-in and check-out."><Input type="number" min="0" placeholder="Not set" value={f.breakAllowedAfterMinutes} onChange={set('breakAllowedAfterMinutes')} /></Field>
      </div>
    </Card>
  );
}

function CycleCard({ org }) {
  const save = useSave('Pay cycle');
  const [day, setDay] = useState(org.cycleStartDay ?? 1);
  const n = Number(day);
  const example = n <= 1 ? 'Calendar month: 1st to the last day.' : `Example: the cycle runs from the ${n}th to the ${n - 1}th of the next month, and is named after the month it ends in.`;
  return (
    <Card>
      <CardHeader title="Pay cycle" sub="Used for payroll runs and for each person's salary so far." action={<Button loading={save.isPending} onClick={() => save.mutate({ cycleStartDay: day })}>Save</Button>} />
      <div className="p-5"><Field label="Cycle starts on day" hint={example} className="max-w-xs"><Input type="number" min="1" max="28" value={day} onChange={(e) => setDay(e.target.value)} /></Field>
        <p className="mt-3 text-[12.5px] text-mute">Runs that already exist keep the dates they were created with.</p></div>
    </Card>
  );
}

function HolidaysCard({ org }) {
  const save = useSave('Holidays');
  const [list, setList] = useState(org.holidays || []);
  const [draft, setDraft] = useState({ date: '', name: '' });
  const add = () => { setList((l) => [...l.filter((h) => h.date !== draft.date), draft].sort((a, b) => a.date.localeCompare(b.date))); setDraft({ date: '', name: '' }); };
  return (
    <Card>
      <CardHeader title="Holidays" sub="Not working days: nobody is absent, and no pay is deducted." action={<Button loading={save.isPending} onClick={() => save.mutate({ holidays: list })}>Save</Button>} />
      <div className="p-5">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Date"><Input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} /></Field>
          <Field label="Name" className="min-w-[200px] flex-1"><Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></Field>
          <Button variant="secondary" icon={Plus} disabled={!draft.date || !draft.name.trim()} onClick={add}>Add</Button>
        </div>
        {!list.length ? <p className="mt-4 text-[14px] text-mute">No holidays added.</p> : (
          <ul className="mt-4">{list.map((h) => (
            <li key={h.date} className="flex items-center gap-3 border-b border-line/70 py-2 text-[14px] last:border-0">
              <span className="w-32 text-mute">{fmtDate(h.date)}</span><span className="flex-1">{h.name}</span>
              <button aria-label={`Remove ${h.name}`} onClick={() => setList((l) => l.filter((x) => x.date !== h.date))} className="rounded-lg p-1.5 text-mute hover:bg-ink/5"><Trash2 className="h-4 w-4" /></button>
            </li>))}
          </ul>
        )}
        <p className="mt-3 text-[12.5px] text-mute">Press Save to keep changes.</p>
      </div>
    </Card>
  );
}

function LeaveTypesCard({ org }) {
  const toast = useToast(); const qc = useQueryClient();
  const [f, setF] = useState({ name: '', annualDays: '', paid: 'true' });
  const add = useMutation({
    mutationFn: () => api.org.addLeaveType({ name: f.name, annualDays: Number(f.annualDays), paid: f.paid === 'true' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org'] }); qc.invalidateQueries({ queryKey: ['leave-types'] }); setF({ name: '', annualDays: '', paid: 'true' }); toast.success('Leave type added. People hired from now on get a balance; add balances for current staff separately.'); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Card>
      <CardHeader title="Leave types" sub="Without-pay leave (WPL) is a type marked as unpaid: its approved days are deducted from salary." />
      <div className="p-5">
        <ul className="mb-4">{org.leaveTypes.map((t) => (
          <li key={t.typeId} className="flex items-center gap-3 border-b border-line/70 py-2 text-[14px] last:border-0">
            <i className="h-3 w-3 rounded-full" style={{ background: t.color }} /><span className="flex-1">{t.name}</span><span className="text-mute">{t.annualDays} days a year</span>
            <Badge tone={t.paid === false ? 'saffron' : 'moss'}>{t.paid === false ? 'Without pay' : 'Paid'}</Badge>
          </li>))}
        </ul>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Name" className="min-w-[180px] flex-1"><Input value={f.name} onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))} /></Field>
          <Field label="Days a year"><Input type="number" min="1" value={f.annualDays} onChange={(e) => setF((s) => ({ ...s, annualDays: e.target.value }))} /></Field>
          <Field label="Pay"><Select value={f.paid} onChange={(e) => setF((s) => ({ ...s, paid: e.target.value }))}><option value="true">Paid</option><option value="false">Without pay (WPL)</option></Select></Field>
          <Button variant="secondary" icon={Plus} loading={add.isPending} disabled={!f.name.trim() || !(Number(f.annualDays) > 0)} onClick={() => add.mutate()}>Add</Button>
        </div>
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const q = useQuery({ queryKey: ['org'], queryFn: api.org.get });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  // key = the saved values, so each card shows what was last stored
  const key = JSON.stringify([q.data.shiftStart, q.data.shiftEnd, q.data.graceMinutes, q.data.halfDayAfterMinutes, q.data.maxBreaksPerDay, q.data.breakAllowedAfterMinutes, q.data.cycleStartDay, q.data.holidays]);
  return (
    <>
      <PageHeader title="Settings" sub={`Rules for ${q.data.name}. Each card saves on its own.`} />
      <div className="space-y-5" key={key}>
        <ShiftCard org={q.data} />
        <BreaksCard org={q.data} />
        <CycleCard org={q.data} />
        <HolidaysCard org={q.data} />
        <LeaveTypesCard org={q.data} />
      </div>
    </>
  );
}

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, FileText, Mail, Plus, UserCheck } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, useToast } from '../../components/ui.jsx';
import { ROLE_LABEL, fmtDateTime, todayISO } from '../../lib/format.js';

const STATUS = { SENT: { label: 'Waiting for candidate', tone: 'saffron' }, SUBMITTED: { label: 'Ready to review', tone: 'teal' }, CONVERTED: { label: 'Employee created', tone: 'moss' } };
const copy = async (text, toast) => { try { await navigator.clipboard.writeText(text); toast.success('Link copied.'); } catch { toast.error('Could not copy. Select the link and copy it by hand.'); } };

function InviteModal({ onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const depts = useQuery({ queryKey: ['depts'], queryFn: api.org.departments });
  const [f, setF] = useState({ name: '', email: '', role: 'EMPLOYEE', deptId: '', designation: '' });
  const [made, setMade] = useState(null);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const create = useMutation({
    mutationFn: () => api.onboarding.create(Object.fromEntries(Object.entries(f).filter(([, v]) => v))),
    onSuccess: (r) => { setMade(r); qc.invalidateQueries({ queryKey: ['invites'] }); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title="Invite a new joiner" sub="They get a link to fill in their details and upload documents."
      footer={made ? <Button onClick={onClose}>Done</Button> : <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={create.isPending} disabled={!f.name.trim() || !f.email.includes('@')} onClick={() => create.mutate()}>Create invite</Button></>}>
      {made ? (
        <div className="space-y-3 text-[14px]">
          <p>{made.emailSent ? <>Email sent to <b>{made.email}</b>.</> : <span className="text-lotus-700">The email could not be sent ({made.emailError}). Share the link yourself.</span>}</p>
          <div className="flex items-center gap-2 rounded-ctl bg-paper p-3"><code className="flex-1 break-all text-[12.5px]">{made.link}</code><Button size="sm" variant="secondary" icon={Copy} onClick={() => copy(made.link, toast)}>Copy</Button></div>
          <p className="text-[13px] text-mute">The link works for 7 days and for one submission.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Full name"><Input value={f.name} onChange={set('name')} /></Field><Field label="Email"><Input type="email" value={f.email} onChange={set('email')} /></Field></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Department"><Select value={f.deptId} onChange={set('deptId')}><option value="">Choose</option>{depts.data?.map((d) => <option key={d.deptId} value={d.deptId}>{d.name}</option>)}</Select></Field>
            <Field label="Job title"><Input value={f.designation} onChange={set('designation')} /></Field>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ReviewModal({ token, onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const q = useQuery({ queryKey: ['invite', token], queryFn: () => api.onboarding.get(token) });
  const depts = useQuery({ queryKey: ['depts'], queryFn: api.org.departments });
  const people = useQuery({ queryKey: ['people-all'], queryFn: () => api.employees.list({ status: 'ACTIVE' }) });
  const { is } = useAuth();
  const [f, setF] = useState(null); const [done, setDone] = useState(null);
  const inv = q.data;
  const form = f || (inv && { designation: inv.designation || '', deptId: inv.deptId || '', role: inv.role, managerId: '', joinDate: todayISO(), basic: '', hra: '', allowances: '' });
  const set = (k) => (e) => setF({ ...form, [k]: e.target.value });
  const convert = useMutation({
    mutationFn: () => api.onboarding.convert(token, { designation: form.designation, deptId: form.deptId, role: form.role, joinDate: form.joinDate, ...(form.managerId && { managerId: form.managerId }), salary: { basic: Number(form.basic), hra: Number(form.hra || 0), allowances: Number(form.allowances || 0) } }),
    onSuccess: (r) => { setDone(r); qc.invalidateQueries({ queryKey: ['invites'] }); qc.invalidateQueries({ queryKey: ['employees'] }); },
    onError: (e) => toast.error(e.message),
  });
  const open = async (d) => { try { const r = await api.onboarding.documentUrl(token, d.documentId); window.open(r.url, '_blank', 'noopener'); } catch (e) { toast.error(e.message); } };
  const s = inv?.submission;
  const ready = form && Number(form.basic) > 0 && form.designation && form.deptId && form.joinDate;
  return (
    <Modal open onClose={onClose} title={inv?.name || 'Review'} sub={inv?.email} size="lg"
      footer={done ? <Button onClick={onClose}>Done</Button> : <><Button variant="secondary" onClick={onClose}>Close</Button>{inv?.status === 'SUBMITTED' && is('HR_ADMIN') && <Button icon={UserCheck} loading={convert.isPending} disabled={!ready} onClick={() => convert.mutate()}>Create employee</Button>}</>}>
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : done ? (
        <div className="space-y-2 text-[14px]"><p><b>{done.employee.name}</b> is now an employee ({done.employee.empCode}). Their documents are on their card.</p><p>Temporary password: <code>{done.tempPassword}</code>. Share it once.</p></div>
      ) : (
        <div className="space-y-5">
          {!s ? <p className="text-[14px] text-mute">The candidate has not submitted the form yet.</p> : (
            <dl className="grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
              {[['Phone', s.phone], ['Date of birth', s.dob], ['Address', s.address], ['Emergency contact', [s.emergencyName, s.emergencyPhone].filter(Boolean).join(', ')], ['Bank', [s.bankName, s.bankIfsc].filter(Boolean).join(', ')], ['Account number', s.bankAccount], ['National ID', s.nationalId], ['Submitted', fmtDateTime(s.submittedAt)]].map(([l, v]) => <div key={l}><dt className="text-[12.5px] text-mute">{l}</dt><dd className="font-medium">{v || '–'}</dd></div>)}
            </dl>
          )}
          {inv.documents.length > 0 && <div><p className="mb-1.5 text-[13.5px] font-semibold">Documents</p><ul className="space-y-1">{inv.documents.map((d) => <li key={d.documentId}><button onClick={() => open(d)} className="inline-flex items-center gap-2 text-[14px] text-peacock-700 hover:underline"><FileText className="h-4 w-4" />{d.filename}<span className="text-mute">({d.category})</span></button></li>)}</ul></div>}
          {inv.status === 'SUBMITTED' && is('HR_ADMIN') && form && (
            <div className="space-y-3 border-t border-line pt-4">
              <p className="text-[13.5px] font-semibold">Job details for the new employee</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Job title"><Input value={form.designation} onChange={set('designation')} /></Field>
                <Field label="Department"><Select value={form.deptId} onChange={set('deptId')}><option value="">Choose</option>{depts.data?.map((d) => <option key={d.deptId} value={d.deptId}>{d.name}</option>)}</Select></Field>
                <Field label="Joining date"><Input type="date" value={form.joinDate} onChange={set('joinDate')} /></Field>
                <Field label="Role"><Select value={form.role} onChange={set('role')}>{['EMPLOYEE', 'PROJECT_MANAGER', 'MANAGER', 'FINANCE', 'HR_MANAGER', 'AUDITOR'].map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</Select></Field>
                <Field label="Reports to" hint="A project manager for an employee."><Select value={form.managerId} onChange={set('managerId')}><option value="">Nobody yet</option>{people.data?.filter((p) => ['MANAGER', 'PROJECT_MANAGER'].includes(p.role)).map((p) => <option key={p.empId} value={p.empId}>{p.name} ({ROLE_LABEL[p.role]})</option>)}</Select></Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-3"><Field label="Basic (monthly)"><Input type="number" min="0" value={form.basic} onChange={set('basic')} /></Field><Field label="HRA"><Input type="number" min="0" value={form.hra} onChange={set('hra')} /></Field><Field label="Allowances"><Input type="number" min="0" value={form.allowances} onChange={set('allowances')} /></Field></div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function OnboardingPage() {
  const toast = useToast(); const qc = useQueryClient();
  const q = useQuery({ queryKey: ['invites'], queryFn: api.onboarding.list });
  const [adding, setAdding] = useState(false); const [review, setReview] = useState(null);
  const resend = useMutation({
    mutationFn: (t) => api.onboarding.resend(t),
    onSuccess: (r) => (r.emailSent ? toast.success('Email sent again.') : toast.error(`Email failed: ${r.emailError}`)),
    onError: (e) => toast.error(e.message),
  });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  return (
    <>
      <PageHeader title="Onboarding" sub="Invite new joiners, review what they submit, then create their employee record." actions={<Button icon={Plus} onClick={() => setAdding(true)}>Invite</Button>} />
      <Card>
        {!q.data.length ? <Empty icon={UserCheck} title="No invites yet" hint="Invite a new joiner to start." /> : (
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Candidate</th><th>Role</th><th>Status</th><th>Invited</th><th /></tr></thead>
            <tbody>{q.data.map((i) => {
              const st = i.expired && i.status === 'SENT' ? { label: 'Expired', tone: 'lotus' } : STATUS[i.status];
              return (
                <tr key={i.token}><td><p className="font-semibold">{i.name}</p><p className="text-[12.5px] text-mute">{i.email}</p></td><td>{ROLE_LABEL[i.role]}</td><td><Badge tone={st.tone}>{st.label}</Badge></td><td className="text-mute">{fmtDateTime(i.createdAt)}</td>
                  <td className="whitespace-nowrap text-right">
                    {i.status === 'SENT' && !i.expired && <><Button size="sm" variant="secondary" icon={Copy} onClick={() => copy(i.link, toast)}>Copy link</Button>{' '}<Button size="sm" variant="secondary" icon={Mail} loading={resend.isPending && resend.variables === i.token} onClick={() => resend.mutate(i.token)}>Resend</Button></>}
                    {i.status !== 'SENT' && <Button size="sm" variant={i.status === 'SUBMITTED' ? 'primary' : 'secondary'} onClick={() => setReview(i.token)}>{i.status === 'SUBMITTED' ? 'Review' : 'View'}</Button>}
                  </td></tr>
              );
            })}</tbody></table></div>
        )}
      </Card>
      {adding && <InviteModal onClose={() => setAdding(false)} />}
      {review && <ReviewModal token={review} onClose={() => setReview(null)} />}
    </>
  );
}

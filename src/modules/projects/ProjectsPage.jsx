import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderKanban, Plus } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, useToast } from '../../components/ui.jsx';
import { fmtDate } from '../../lib/format.js';

export const PROJECT_STATUS = { ACTIVE: { label: 'Active', tone: 'moss' }, ON_HOLD: { label: 'On hold', tone: 'saffron' }, COMPLETED: { label: 'Completed', tone: 'neutral' } };

export function Progress({ counts }) {
  const pct = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[12.5px] text-mute"><span>{counts.done} of {counts.total} tasks done</span>{counts.overdue > 0 && <span className="font-semibold text-lotus-600">{counts.overdue} overdue</span>}</div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full bg-moss-600" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function NewProject({ onClose }) {
  const { user } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const hr = user.role !== 'MANAGER'; // HR creates a project on behalf of a manager
  const people = useQuery({ queryKey: ['people-all'], queryFn: () => api.employees.list({ status: 'ACTIVE' }) });
  const [f, setF] = useState({ name: '', managerId: '', pmId: '', startDate: '', endDate: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = useMutation({
    mutationFn: () => api.projects.create(Object.fromEntries(Object.entries(f).filter(([, v]) => v))),
    onSuccess: () => { toast.success('Project created.'); qc.invalidateQueries({ queryKey: ['projects'] }); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const list = people.data || [];
  return (
    <Modal open onClose={onClose} title="New project" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={f.name.trim().length < 2 || (hr && !f.managerId)} onClick={() => save.mutate()}>Create</Button></>}>
      <div className="space-y-4">
        <Field label="Project name"><Input value={f.name} onChange={set('name')} /></Field>
        {hr && <Field label="Manager who owns it"><Select value={f.managerId} onChange={set('managerId')}><option value="">Choose</option>{list.filter((p) => p.role === 'MANAGER').map((p) => <option key={p.empId} value={p.empId}>{p.name}</option>)}</Select></Field>}
        <Field label="Project manager" hint="You can also choose this later."><Select value={f.pmId} onChange={set('pmId')}><option value="">Not chosen yet</option>{list.filter((p) => p.role === 'PROJECT_MANAGER').map((p) => <option key={p.empId} value={p.empId}>{p.name}</option>)}</Select></Field>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Start"><Input type="date" value={f.startDate} onChange={set('startDate')} /></Field><Field label="End"><Input type="date" value={f.endDate} onChange={set('endDate')} /></Field></div>
      </div>
    </Modal>
  );
}

export default function ProjectsPage() {
  const { is } = useAuth();
  const q = useQuery({ queryKey: ['projects'], queryFn: api.projects.list });
  const [adding, setAdding] = useState(false);
  const canCreate = is('MANAGER', 'HR_ADMIN');
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  return (
    <>
      <PageHeader title="Projects" sub="Who works on what, and how far along it is." actions={canCreate && <Button icon={Plus} onClick={() => setAdding(true)}>New project</Button>} />
      {!q.data.length ? <Card><Empty icon={FolderKanban} title="No projects yet" hint={canCreate ? 'Create one, choose its project manager, and add the team.' : 'Projects you work on show up here.'} /></Card> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {q.data.map((p) => (
            <Link key={p.projectId} to={`/projects/${p.projectId}`} className="block">
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-2"><h2 className="text-[16px] font-bold leading-snug">{p.name}</h2><Badge tone={PROJECT_STATUS[p.status].tone}>{PROJECT_STATUS[p.status].label}</Badge></div>
                <p className="text-[13px] text-mute">Manager {p.managerName || '–'} · Project manager {p.pmName || 'not chosen'}</p>
                {p.endDate && <p className="mb-3 text-[13px] text-mute">Ends {fmtDate(p.endDate)}</p>}
                <div className="mt-3"><Progress counts={p.taskCounts} /></div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {adding && <NewProject onClose={() => setAdding(false)} />}
    </>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, CardHeader, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, Textarea, useToast } from '../../components/ui.jsx';
import { fmtDate, todayISO } from '../../lib/format.js';
import { PROJECT_STATUS, Progress } from './ProjectsPage.jsx';

const TASK = { TODO: { label: 'To do', tone: 'neutral' }, IN_PROGRESS: { label: 'In progress', tone: 'saffron' }, DONE: { label: 'Done', tone: 'moss' } };

// A manager gives a task to the project manager; a project manager gives tasks to the project's members.
function TaskModal({ project, onClose }) {
  const { user } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const choices = user.role === 'MANAGER' ? [{ empId: project.pmId, name: project.pmName }] : project.members;
  const [f, setF] = useState({ title: '', description: '', assigneeId: choices[0]?.empId || '', dueDate: todayISO() });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = useMutation({
    mutationFn: () => api.projects.addTask(project.projectId, f),
    onSuccess: () => { toast.success('Task assigned.'); qc.invalidateQueries({ queryKey: ['project', project.projectId] }); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title="Assign a task" sub={user.role === 'MANAGER' ? 'It goes to the project manager.' : 'It shows on the person\'s Today page.'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={f.title.trim().length < 3 || !f.assigneeId || !f.dueDate} onClick={() => save.mutate()}>Assign</Button></>}>
      <div className="space-y-4">
        <Field label="Task"><Input value={f.title} onChange={set('title')} maxLength={120} /></Field>
        <Field label="Details (optional)"><Textarea value={f.description} onChange={set('description')} maxLength={500} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Assign to"><Select value={f.assigneeId} onChange={set('assigneeId')}>{!choices.length && <option value="">No one to assign to</option>}{choices.map((c) => <option key={c.empId} value={c.empId}>{c.name}</option>)}</Select></Field>
          <Field label="Due date"><Input type="date" value={f.dueDate} onChange={set('dueDate')} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function Team({ project }) {
  const toast = useToast(); const qc = useQueryClient();
  const people = useQuery({ queryKey: ['people-all'], queryFn: () => api.employees.list({ status: 'ACTIVE' }), enabled: project.canManage });
  const [pick, setPick] = useState(''); const [pm, setPm] = useState('');
  const refresh = () => { qc.invalidateQueries({ queryKey: ['project', project.projectId] }); qc.invalidateQueries({ queryKey: ['projects'] }); };
  const add = useMutation({ mutationFn: () => api.projects.addMember(project.projectId, pick), onSuccess: () => { setPick(''); refresh(); }, onError: (e) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: (id) => api.projects.removeMember(project.projectId, id), onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const setPmM = useMutation({ mutationFn: () => api.projects.setPm(project.projectId, pm), onSuccess: () => { toast.success('Project manager changed.'); setPm(''); refresh(); }, onError: (e) => toast.error(e.message) });
  const list = people.data || [];
  const taken = new Set(project.members.map((m) => m.empId));
  return (
    <Card>
      <CardHeader title="Team" sub={project.pmName ? `Project manager: ${project.pmName}` : 'No project manager yet'} />
      <div className="p-5">
        {project.canManage && (
          <div className="mb-4 flex flex-wrap items-end gap-2">
            <Field label={project.pmName ? 'Change project manager' : 'Project manager'} className="min-w-[200px] flex-1"><Select value={pm} onChange={(e) => setPm(e.target.value)}><option value="">Choose</option>{list.filter((p) => p.role === 'PROJECT_MANAGER' && p.empId !== project.pmId).map((p) => <option key={p.empId} value={p.empId}>{p.name}</option>)}</Select></Field>
            <Button variant="secondary" disabled={!pm} loading={setPmM.isPending} onClick={() => setPmM.mutate()}>Set</Button>
          </div>
        )}
        {!project.members.length ? <p className="text-[14px] text-mute">No members yet.</p> : (
          <ul>{project.members.map((m) => (
            <li key={m.empId} className="flex items-center gap-3 border-b border-line/70 py-2.5 text-[14px] last:border-0">
              <div className="flex-1"><p className="font-semibold">{m.name}</p><p className="text-[12.5px] text-mute">{m.designation}</p></div>
              {project.canManage && <button aria-label={`Remove ${m.name}`} onClick={() => window.confirm(`Remove ${m.name} from this project?`) && remove.mutate(m.empId)} className="rounded-lg p-1.5 text-mute hover:bg-ink/5"><Trash2 className="h-4 w-4" /></button>}
            </li>))}
          </ul>
        )}
        {project.canManage && (
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <Field label="Add a team member" hint={project.pmId ? '' : 'Choose a project manager first.'} className="min-w-[200px] flex-1"><Select value={pick} onChange={(e) => setPick(e.target.value)} disabled={!project.pmId}><option value="">Choose</option>{list.filter((p) => p.role === 'EMPLOYEE' && !taken.has(p.empId)).map((p) => <option key={p.empId} value={p.empId}>{p.name}</option>)}</Select></Field>
            <Button icon={UserPlus} disabled={!pick} loading={add.isPending} onClick={() => add.mutate()}>Add</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams(); const { user } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const q = useQuery({ queryKey: ['project', id], queryFn: () => api.projects.get(id) });
  const [adding, setAdding] = useState(false);
  const status = useMutation({ mutationFn: (s) => api.projects.update(id, { status: s }), onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }), onError: (e) => toast.error(e.message) });
  const del = useMutation({ mutationFn: (taskId) => api.projects.deleteTask(id, taskId), onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }), onError: (e) => toast.error(e.message) });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const p = q.data;
  return (
    <>
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-peacock-700 hover:underline"><ArrowLeft className="h-4 w-4" />Projects</Link>
      <PageHeader title={p.name} sub={`Manager ${p.managerName || '–'}${p.startDate ? ` · ${fmtDate(p.startDate)}${p.endDate ? ` to ${fmtDate(p.endDate)}` : ''}` : ''}`}
        actions={<div className="flex items-center gap-2">
          {p.canManage ? <Select value={p.status} onChange={(e) => status.mutate(e.target.value)} aria-label="Project status">{Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Select> : <Badge tone={PROJECT_STATUS[p.status].tone}>{PROJECT_STATUS[p.status].label}</Badge>}
          {p.canAssignTasks && <Button icon={Plus} onClick={() => setAdding(true)} disabled={user.role === 'MANAGER' ? !p.pmId : !p.members.length}>Assign task</Button>}
        </div>} />
      <div className="mb-5 max-w-xl"><Progress counts={p.taskCounts} /></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader title="Tasks" sub={`${p.taskCounts.todo} to do · ${p.taskCounts.inProgress} in progress · ${p.taskCounts.done} done`} />
          {!p.tasks.length ? <Empty title="No tasks yet" hint={p.canAssignTasks ? 'Assign the first task.' : undefined} /> : (
            <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Task</th><th>Assigned to</th><th>Due</th><th>Status</th>{p.canAssignTasks && <th />}</tr></thead>
              <tbody>{p.tasks.map((t) => (
                <tr key={t.taskId}><td>{t.title}</td><td>{t.assigneeName}</td>
                  <td>{fmtDate(t.dueDate)}{t.overdue && <span className="ml-2 text-[12.5px] font-semibold text-lotus-600">overdue</span>}</td>
                  <td><Badge tone={TASK[t.status].tone}>{TASK[t.status].label}</Badge></td>
                  {p.canAssignTasks && <td className="text-right"><button aria-label={`Delete ${t.title}`} onClick={() => window.confirm('Delete this task?') && del.mutate(t.taskId)} className="rounded-lg p-1.5 text-mute hover:bg-ink/5"><Trash2 className="h-4 w-4" /></button></td>}</tr>))}
              </tbody></table></div>
          )}
        </Card>
        <Team project={p} />
      </div>
      {adding && <TaskModal project={p} onClose={() => setAdding(false)} />}
    </>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { Badge, Card, CardHeader, useToast } from '../../components/ui.jsx';
import { fmtDate } from '../../lib/format.js';

const STATUS = { TODO: { label: 'To do', tone: 'neutral' }, IN_PROGRESS: { label: 'In progress', tone: 'saffron' }, DONE: { label: 'Done', tone: 'moss' } };

/** Tasks your project manager gave you that are due today (or late). Change the status as you work. */
export default function TodayTasks() {
  const toast = useToast(); const qc = useQueryClient();
  const q = useQuery({ queryKey: ['my-tasks'], queryFn: api.projects.myTasks });
  const set = useMutation({
    mutationFn: ({ t, status }) => api.projects.setTaskStatus(t.projectId, t.taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tasks'] }),
    onError: (e) => toast.error(e.message),
  });

  if (q.isLoading || q.error || !q.data.length) return null; // nothing assigned: no card
  return (
    <Card>
      <CardHeader title="Your tasks today" sub={`${q.data.filter((t) => t.status !== 'DONE').length} still open`} />
      <ul>
        {q.data.map((t) => (
          <li key={t.taskId} className="flex flex-wrap items-center gap-3 border-b border-line/70 px-5 py-3 last:border-0">
            <div className="min-w-0 flex-1">
              <p className={`text-[14px] font-semibold ${t.status === 'DONE' ? 'text-mute line-through' : ''}`}>{t.title}</p>
              <p className="text-[13px] text-mute">{t.projectName}{t.overdue && <span className="ml-2 font-semibold text-lotus-600">Overdue, was due {fmtDate(t.dueDate)}</span>}</p>
            </div>
            <Badge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Badge>
            {t.status !== 'DONE' && (
              <div className="flex gap-1.5">
                {t.status === 'TODO' && <button disabled={set.isPending} onClick={() => set.mutate({ t, status: 'IN_PROGRESS' })} className="rounded-ctl border border-line px-2.5 py-1 text-[12.5px] font-semibold hover:bg-paper">Start</button>}
                <button disabled={set.isPending} onClick={() => set.mutate({ t, status: 'DONE' })} className="rounded-ctl bg-moss-50 px-2.5 py-1 text-[12.5px] font-semibold text-moss-700 hover:bg-moss-100">Mark done</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { api } from '../../api/index.js';
import { Avatar, Button, ErrorNote, Field, Spinner, StatusBadge, Textarea, useToast, cx } from '../../components/ui.jsx';
import { REQ_STATUS, ROLE_LABEL, fmtDateTime } from '../../lib/format.js';

const stageLabel = (s) => (s.approverType === 'REPORTING_MANAGER' ? 'Manager' : ROLE_LABEL[s.role] || s.role);
const VERB = { approve: 'Approved', reject: 'Rejected', escalate: 'Escalated', cancel: 'Cancelled' };
const VERB_TONE = { approve: 'bg-moss-500', reject: 'bg-lotus-500', escalate: 'bg-saffron-500', cancel: 'bg-mute' };

/** Stage tracker + audit timeline + decision box. Same component serves Leave, Expense, Asset and Travel (v3 §4.2). */
export default function ApprovalDetail({ reqId, onChanged }) {
  const toast = useToast(); const qc = useQueryClient();
  const [comment, setComment] = useState('');
  const q = useQuery({ queryKey: ['approval', reqId], queryFn: () => api.approvals.detail(reqId) });

  const act = useMutation({
    mutationFn: (action) => api.approvals.act(reqId, { action, comment: comment.trim() || undefined }),
    onSuccess: (_d, action) => {
      setComment('');
      ['approval', 'approvals-pending', 'approvals-history', 'notifs', 'leave-me', 'expenses', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success(`${VERB[action]}.`); onChanged?.();
    },
    onError: (e) => { toast.error(e.message); qc.invalidateQueries({ queryKey: ['approval', reqId] }); },
  });

  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const a = q.data; const open = a.status === 'PENDING' || a.status === 'ESCALATED';

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Avatar name={a.requesterName} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold leading-snug">{a.summary}</p>
          <p className="mt-0.5 text-[14px] text-mute">Requested by {a.requesterName} on {fmtDateTime(a.createdAt)}</p>
        </div>
        <StatusBadge map={REQ_STATUS} value={a.status} />
      </div>

      {a.payload?.reason && <p className="rounded-ctl bg-paper px-4 py-3 text-[14px] text-ink-700">“{a.payload.reason}”</p>}

      <ol className="flex items-stretch gap-2" aria-label="Approval stages">
        {a.stages.map((s, i) => {
          const n = i + 1;
          const state = a.status === 'APPROVED' || n < a.currentStage ? 'done' : n === a.currentStage && open ? 'now' : a.status === 'REJECTED' && n === a.currentStage ? 'rejected' : 'later';
          return (
            <li key={n} className={cx('flex-1 rounded-ctl border px-3 py-2.5', state === 'done' && 'border-moss-100 bg-moss-50', state === 'now' && 'border-saffron-500 bg-saffron-50', state === 'rejected' && 'border-lotus-100 bg-lotus-50', state === 'later' && 'border-line')}>
              <p className="text-[12.5px] text-mute">Stage {n}</p>
              <p className="text-[14px] font-semibold">{stageLabel(s)}</p>
              <p className="text-[12.5px] text-mute">{state === 'done' ? 'Approved' : state === 'now' ? (a.approver?.kind === 'USER' ? a.approver.label : 'Waiting') : state === 'rejected' ? 'Rejected' : 'Not yet'}</p>
            </li>
          );
        })}
      </ol>

      <div>
        <h3 className="mb-3 text-[15px] font-semibold">History</h3>
        <ul className="space-y-0">
          <li className="flex gap-3 pb-4"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-peacock-500" /><div><p className="text-[14px] font-medium">Submitted</p><p className="text-[13px] text-mute">{fmtDateTime(a.createdAt)}</p></div></li>
          {a.actions.map((x) => (
            <li key={x.SK || x.at} className="flex gap-3 pb-4">
              <span className={cx('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', VERB_TONE[x.action])} />
              <div><p className="text-[14px] font-medium">{VERB[x.action]} by {x.actorName}</p><p className="text-[13px] text-mute">{ROLE_LABEL[x.actorRole]} · {fmtDateTime(x.at)}</p>{x.comment && <p className="mt-1 text-[14px] text-ink-700">“{x.comment}”</p>}</div>
            </li>
          ))}
        </ul>
      </div>

      {a.canAct && (
        <div className="rounded-card border border-line bg-paper/60 p-4">
          <Field label="Comment" hint="Required when rejecting."><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a note for the requester" /></Field>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="success" icon={Check} loading={act.isPending && act.variables === 'approve'} disabled={act.isPending} onClick={() => act.mutate('approve')}>Approve</Button>
            <Button variant="dangerSoft" icon={X} disabled={act.isPending || comment.trim().length < 3} onClick={() => act.mutate('reject')} title={comment.trim().length < 3 ? 'Add a reason first' : undefined}>Reject</Button>
            <Button variant="ghost" icon={ArrowUpRight} disabled={act.isPending} onClick={() => act.mutate('escalate')} className="ml-auto">Escalate</Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, Badge, Card, Empty, ErrorNote, PageHeader, Spinner, StatusBadge, Tabs, cx } from '../../components/ui.jsx';
import ApprovalDetail from './ApprovalDetail.jsx';
import { REQ_STATUS, fmtDateTime } from '../../lib/format.js';

const TYPE = { LEAVE: 'Leave', EXPENSE: 'Expense', ASSET: 'Asset', TRAVEL: 'Travel' };

export default function ApprovalsPage() {
  const { isHR, is } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [tab, setTab] = useState('inbox'); const [hist, setHist] = useState('APPROVED');
  const canHistory = isHR || is('AUDITOR');
  const inbox = useQuery({ queryKey: ['approvals-pending'], queryFn: api.approvals.pending });
  const history = useQuery({ queryKey: ['approvals-history', hist], queryFn: () => api.approvals.byStatus(hist), enabled: tab === 'history' && canHistory });
  const list = tab === 'inbox' ? inbox : history;
  const open = sp.get('open');
  const select = (id) => setSp(id ? { open: id } : {});

  return (
    <>
      <PageHeader title="Approvals" sub="Decide what is waiting on you, and see how past requests were settled."
        actions={canHistory && <Tabs value={tab} onChange={(t) => { setTab(t); select(null); }} tabs={[{ id: 'inbox', label: 'Waiting on me', count: inbox.data?.length || undefined }, { id: 'history', label: 'Decided' }]} />} />
      {tab === 'history' && (
        <div className="mb-4"><Tabs value={hist} onChange={setHist} tabs={[{ id: 'APPROVED', label: 'Approved' }, { id: 'REJECTED', label: 'Rejected' }, { id: 'CANCELLED', label: 'Cancelled' }]} /></div>
      )}
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="self-start overflow-hidden">
          {list.isLoading ? <Spinner /> : list.error ? <ErrorNote error={list.error} retry={list.refetch} /> : !list.data?.length ? (
            <Empty icon={ClipboardCheck} title={tab === 'inbox' ? 'Nothing waiting on you' : 'No requests here yet'} hint={tab === 'inbox' ? 'New requests from your team show up here the moment they are submitted.' : undefined} />
          ) : (
            <ul>
              {list.data.map((a) => (
                <li key={a.reqId} className="border-b border-line/70 last:border-0">
                  <button onClick={() => select(a.reqId)} className={cx('flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-paper', open === a.reqId && 'bg-peacock-50')}>
                    <Avatar name={a.requesterName} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><p className="truncate text-[14.5px] font-semibold">{a.requesterName}</p><Badge tone="teal" dot={false}>{TYPE[a.entityType] || a.entityType}</Badge></div>
                      <p className="mt-0.5 truncate text-[13.5px] text-mute">{a.summary}</p>
                      <p className="mt-1.5 flex items-center gap-2 text-[12.5px] text-mute">{fmtDateTime(a.createdAt)}{a.status === 'ESCALATED' && <StatusBadge map={REQ_STATUS} value="ESCALATED" />}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="min-h-[300px] p-6">
          {open ? <ApprovalDetail key={open} reqId={open} onChanged={() => tab === 'inbox' && select(null)} /> : <Empty title="Pick a request" hint="Choose one from the list to read the details and decide." />}
        </Card>
      </div>
    </>
  );
}

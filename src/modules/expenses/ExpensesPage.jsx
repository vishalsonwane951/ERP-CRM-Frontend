import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt } from 'lucide-react';
import { api } from '../../api/index.js';
import { Button, Card, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, StatusBadge, Textarea, useToast } from '../../components/ui.jsx';
import ApprovalDetail from '../approvals/ApprovalDetail.jsx';
import { REQ_STATUS, fmtDate, money, todayISO } from '../../lib/format.js';

const CATS = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];

function NewExpense({ onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const [f, setF] = useState({ category: 'Travel', amount: '', date: todayISO(), description: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const m = useMutation({
    mutationFn: () => api.expenses.submit({ ...f, amount: Number(f.amount) }),
    onSuccess: () => { ['expenses', 'approvals-pending'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success('Expense submitted.'); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title="New expense" sub="Goes to your manager, then Finance."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={m.isPending} disabled={!(Number(f.amount) > 0) || f.description.trim().length < 3} onClick={() => m.mutate()}>Submit expense</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><Select value={f.category} onChange={set('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Amount (INR)"><Input type="number" min="1" inputMode="decimal" value={f.amount} onChange={set('amount')} /></Field>
        </div>
        <Field label="Date of expense"><Input type="date" max={todayISO()} value={f.date} onChange={set('date')} /></Field>
        <Field label="What was it for?"><Textarea value={f.description} onChange={set('description')} maxLength={300} /></Field>
      </div>
    </Modal>
  );
}

export default function ExpensesPage() {
  const [adding, setAdding] = useState(false); const [view, setView] = useState(null);
  const q = useQuery({ queryKey: ['expenses'], queryFn: api.expenses.list });
  return (
    <>
      <PageHeader title="Expenses" sub="Claims you have submitted." actions={<Button icon={Plus} onClick={() => setAdding(true)}>New expense</Button>} />
      <Card>
        {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.length ? <Empty icon={Receipt} title="No expenses yet" hint="Submit a claim and follow it through approval here." action={<Button icon={Plus} onClick={() => setAdding(true)}>New expense</Button>} /> : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th className="text-right">Amount</th><th>Status</th></tr></thead>
              <tbody>{q.data.map((x) => (
                <tr key={x.reqId} className="row-click" onClick={() => setView(x.reqId)}>
                  <td>{fmtDate(x.date)}</td><td>{x.category}</td><td className="max-w-[320px] truncate">{x.description}</td>
                  <td className="text-right font-semibold tabular-nums">{money(x.amount)}</td><td><StatusBadge map={REQ_STATUS} value={x.status} /></td>
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {adding && <NewExpense onClose={() => setAdding(false)} />}
      <Modal open={!!view} onClose={() => setView(null)} title="Expense details" side>{view && <ApprovalDetail reqId={view} />}</Modal>
    </>
  );
}

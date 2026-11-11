import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Users } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, Badge, Button, Card, Empty, ErrorNote, Input, Modal, PageHeader, Spinner } from '../../components/ui.jsx';
import EmployeeForm from './EmployeeForm.jsx';
import { ROLE_LABEL } from '../../lib/format.js';

export default function EmployeesPage() {
  const { user, isHR } = useAuth(); const nav = useNavigate();
  const [q, setQ] = useState(''); const [adding, setAdding] = useState(false); const [created, setCreated] = useState(null);
  const list = useQuery({ queryKey: ['people', q], queryFn: () => api.employees.list({ q: q || undefined }), placeholderData: (p) => p });
  const depts = useQuery({ queryKey: ['depts'], queryFn: api.org.departments });
  const dept = (id) => depts.data?.find((d) => d.deptId === id)?.name || '–';
  return (
    <>
      <PageHeader title="People" sub={user.role === 'MANAGER' ? 'The people who report to you.' : `${list.data?.length ?? ''} people in ${user.orgName}`}
        actions={isHR && <Button icon={Plus} onClick={() => setAdding(true)}>Add person</Button>} />
      <Card>
        <div className="border-b border-line p-4"><div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" /><Input className="input !pl-9" placeholder="Search by name, email or title" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search people" /></div></div>
        {list.isLoading ? <Spinner /> : list.error ? <ErrorNote error={list.error} retry={list.refetch} /> : !list.data.length ? <Empty icon={Users} title="No one found" hint={q ? 'Try a different name or title.' : 'No people to show yet.'} /> : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Person</th><th>Department</th><th>Access</th><th>Status</th></tr></thead>
              <tbody>{list.data.map((e) => (
                <tr key={e.empId} className="row-click" onClick={() => nav(`/people/${e.empId}`)}>
                  <td><div className="flex items-center gap-3"><Avatar name={e.name} /><div><p className="font-semibold">{e.name}</p><p className="text-[13px] text-mute">{e.designation} · {e.empCode}</p></div></div></td>
                  <td>{dept(e.deptId)}</td><td>{ROLE_LABEL[e.role]}</td><td><Badge tone={e.status === 'ACTIVE' ? 'moss' : 'neutral'}>{e.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge></td>
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {adding && <EmployeeForm onClose={() => setAdding(false)} onCreated={setCreated} />}
      <Modal open={!!created} onClose={() => setCreated(null)} title="Share this password once" sub={created?.employee?.name} size="sm" footer={<Button onClick={() => setCreated(null)}>Done</Button>}>
        <p className="text-[14px] text-ink-700">Send it to {created?.employee?.name} privately. It is not shown again, and they can sign in with {created?.employee?.email}.</p>
        <p className="mt-4 select-all rounded-ctl bg-paper px-4 py-3 text-center font-display text-[22px] font-semibold tracking-wide">{created?.tempPassword}</p>
      </Modal>
    </>
  );
}

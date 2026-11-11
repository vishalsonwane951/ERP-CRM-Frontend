import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, Badge, Button, Card, CardHeader, Definition, ErrorNote, Spinner, Tabs } from '../../components/ui.jsx';
import MonthCalendar from '../attendance/MonthCalendar.jsx';
import DocumentsPanel from '../documents/DocumentsPanel.jsx';
import EmployeeForm from './EmployeeForm.jsx';
import { ROLE_LABEL, fmtDate, money, monthLabel, shiftMonth, todayISO } from '../../lib/format.js';

function MonthTab({ id, tz }) {
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const q = useQuery({ queryKey: ['att-emp', id, month], queryFn: () => api.attendance.forEmployee(id, month) });
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-[18px] font-semibold">{monthLabel(month)}</h2>
        <div className="flex gap-1"><Button variant="secondary" size="sm" onClick={() => setMonth(shiftMonth(month, -1))}>Previous</Button><Button variant="secondary" size="sm" disabled={month >= todayISO().slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}>Next</Button></div>
      </div>
      {q.isLoading ? <Spinner /> : <MonthCalendar month={month} data={q.data} tz={tz} />}
    </Card>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams(); const { user, isHR } = useAuth();
  const [tab, setTab] = useState('profile'); const [editing, setEditing] = useState(false);
  const q = useQuery({ queryKey: ['employee', id], queryFn: () => api.employees.get(id) });
  const depts = useQuery({ queryKey: ['depts'], queryFn: api.org.departments });
  const mgr = useQuery({ queryKey: ['employee', q.data?.managerId], queryFn: () => api.employees.get(q.data.managerId), enabled: !!q.data?.managerId && isHR });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const e = q.data;
  return (
    <>
      <Link to="/people" className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-peacock-700 hover:underline"><ArrowLeft className="h-4 w-4" />People</Link>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Avatar name={e.name} size={64} />
        <div className="flex-1"><h1 className="text-[24px] font-bold leading-tight">{e.name}</h1><p className="mt-2 text-[14.5px] text-mute">{e.designation} · {e.empCode}</p></div>
        <Badge tone={e.status === 'ACTIVE' ? 'moss' : 'neutral'}>{e.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge>
        {isHR && <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>Edit</Button>}
      </div>
      <div className="mb-4"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'profile', label: 'Profile' }, { id: 'attendance', label: 'Attendance' }, ...(isHR ? [{ id: 'docs', label: 'Documents' }] : [])]} /></div>
      {tab === 'profile' && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card><CardHeader title="Job" /><dl className="px-5 pb-3 pt-1">
            <Definition label="Department">{depts.data?.find((d) => d.deptId === e.deptId)?.name}</Definition>
            <Definition label="Access role">{ROLE_LABEL[e.role]}</Definition>
            <Definition label="Reports to">{e.managerId === user.empId ? 'You' : mgr.data?.name}</Definition>
            <Definition label="Joined">{fmtDate(e.joinDate)}</Definition></dl></Card>
          <Card><CardHeader title="Contact" /><dl className="px-5 pb-3 pt-1"><Definition label="Email">{e.email}</Definition><Definition label="Phone">{e.phone}</Definition></dl></Card>
          {e.salary && (
            <Card><CardHeader title="Pay" sub="Monthly" /><dl className="px-5 pb-3 pt-1">
              <Definition label="Basic">{money(e.salary.basic)}</Definition><Definition label="HRA">{money(e.salary.hra)}</Definition>
              <Definition label="Allowances">{money(e.salary.allowances)}</Definition>
              <Definition label="Gross"><b>{money(e.salary.basic + e.salary.hra + e.salary.allowances)}</b></Definition></dl></Card>
          )}
          {(e.bankAccount || e.nationalId) && (
            <Card><CardHeader title="Bank and identity" sub="Stored encrypted" /><dl className="px-5 pb-3 pt-1"><Definition label="Bank account"><span className="tabular-nums">{e.bankAccount}</span></Definition><Definition label="National ID"><span className="tabular-nums">{e.nationalId}</span></Definition></dl></Card>
          )}
        </div>
      )}
      {tab === 'attendance' && <MonthTab id={id} tz={user.timezone} />}
      {tab === 'docs' && <Card><DocumentsPanel employeeId={id} canUploadAll /></Card>}
      {editing && <EmployeeForm employee={e} onClose={() => setEditing(false)} />}
    </>
  );
}

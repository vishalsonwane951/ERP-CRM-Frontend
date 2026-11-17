import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
<<<<<<< HEAD
import { ArrowLeft, Pencil } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, Badge, Button, Card, CardHeader, Definition, ErrorNote, Spinner, Tabs } from '../../components/ui.jsx';
import MonthCalendar from '../attendance/MonthCalendar.jsx';
import DocumentsPanel from '../documents/DocumentsPanel.jsx';
=======
import { ArrowLeft, Pencil, Wallet } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, Badge, Button, Card, CardHeader, Definition, Empty, ErrorNote, Modal, Spinner, Tabs } from '../../components/ui.jsx';
import MonthCalendar from '../attendance/MonthCalendar.jsx';
import DocumentsPanel from '../documents/DocumentsPanel.jsx';
import PerformanceCard from './PerformanceCard.jsx';
import { PayslipView } from '../payroll/PayslipsPage.jsx';
>>>>>>> recovery-master
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

<<<<<<< HEAD
export default function EmployeeDetailPage() {
  const { id } = useParams(); const { user, isHR } = useAuth();
=======
const RUN = { DRAFT: 'Draft', CALCULATED: 'Calculated', SUBMITTED: 'With Finance', RETURNED: 'Returned to HR', APPROVED: 'Approved', PAID: 'Paid', PAYSLIPS_SENT: 'Payslip sent' };

// Every payslip line of this person (HR and finance only; the employee uses the Payslips page)
function PayslipsTab({ id, org }) {
  const q = useQuery({ queryKey: ['emp-payslips', id], queryFn: () => api.payroll.employeePayslips(id) });
  const [open, setOpen] = useState(null);
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  return (
    <Card>
      {!q.data.length ? <Empty icon={Wallet} title="No payslips yet" /> : (
        <table className="tbl"><thead><tr><th>Month</th><th className="text-right">Gross</th><th className="text-right">Net pay</th><th>Payment</th><th>Run</th></tr></thead>
          <tbody>{q.data.map((l) => (
            <tr key={l.runId} className="row-click" onClick={() => setOpen(l)}><td className="font-semibold">{monthLabel(l.period)}</td><td className="text-right tabular-nums">{money(l.gross)}</td><td className="text-right font-semibold tabular-nums">{money(l.net)}</td>
              <td>{l.payStatus ? <Badge tone={l.payStatus === 'PAID' ? 'moss' : l.payStatus === 'PENDING' ? 'neutral' : 'lotus'}>{l.payStatus.replace('_', ' ').toLowerCase()}</Badge> : '–'}</td><td className="text-mute">{RUN[l.runStatus]}</td></tr>))}
          </tbody></table>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title="Payslip" size="lg">{open && <PayslipView line={open} org={org} />}</Modal>
    </Card>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams(); const { user, isHR, is, has } = useAuth();
>>>>>>> recovery-master
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
<<<<<<< HEAD
      <div className="mb-4"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'profile', label: 'Profile' }, { id: 'attendance', label: 'Attendance' }, ...(isHR ? [{ id: 'docs', label: 'Documents' }] : [])]} /></div>
=======
      <div className="mb-4"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'profile', label: 'Profile' }, { id: 'attendance', label: 'Attendance' }, { id: 'performance', label: 'Performance' }, ...(has('payroll') && is('HR_ADMIN', 'HR_MANAGER', 'FINANCE') ? [{ id: 'payslips', label: 'Payslips' }] : []), ...(isHR ? [{ id: 'docs', label: 'Documents' }] : [])]} /></div>
>>>>>>> recovery-master
      {tab === 'profile' && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card><CardHeader title="Job" /><dl className="px-5 pb-3 pt-1">
            <Definition label="Department">{depts.data?.find((d) => d.deptId === e.deptId)?.name}</Definition>
            <Definition label="Access role">{ROLE_LABEL[e.role]}</Definition>
            <Definition label="Reports to">{e.managerId === user.empId ? 'You' : mgr.data?.name}</Definition>
            <Definition label="Joined">{fmtDate(e.joinDate)}</Definition></dl></Card>
<<<<<<< HEAD
          <Card><CardHeader title="Contact" /><dl className="px-5 pb-3 pt-1"><Definition label="Email">{e.email}</Definition><Definition label="Phone">{e.phone}</Definition></dl></Card>
=======
          <Card><CardHeader title="Contact" /><dl className="px-5 pb-3 pt-1"><Definition label="Email">{e.email}</Definition><Definition label="Phone">{e.phone}</Definition>{e.dob && <Definition label="Date of birth">{fmtDate(e.dob)}</Definition>}{e.address && <Definition label="Address">{e.address}</Definition>}{e.emergencyName && <Definition label="Emergency contact">{[e.emergencyName, e.emergencyPhone].filter(Boolean).join(', ')}</Definition>}</dl></Card>
>>>>>>> recovery-master
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
<<<<<<< HEAD
=======
      {tab === 'performance' && <PerformanceCard id={id} />}
      {tab === 'payslips' && <PayslipsTab id={id} org={user.orgName} />}
>>>>>>> recovery-master
      {tab === 'docs' && <Card><DocumentsPanel employeeId={id} canUploadAll /></Card>}
      {editing && <EmployeeForm employee={e} onClose={() => setEditing(false)} />}
    </>
  );
}

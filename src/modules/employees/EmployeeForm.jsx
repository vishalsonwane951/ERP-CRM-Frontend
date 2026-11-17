import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Field, Input, Modal, Select, useToast } from '../../components/ui.jsx';
import { ROLE_LABEL } from '../../lib/format.js';

const ROLES = ['EMPLOYEE', 'PROJECT_MANAGER', 'MANAGER', 'HR_MANAGER', 'HR_ADMIN', 'FINANCE', 'AUDITOR'];

/** Create (no `employee`) or edit. Pay, bank and role fields only render for HR admins; the API enforces it too. */
export default function EmployeeForm({ employee, onClose, onCreated }) {
  const toast = useToast(); const qc = useQueryClient(); const { is } = useAuth();
  const admin = is('HR_ADMIN');
  const edit = !!employee;
  const depts = useQuery({ queryKey: ['depts'], queryFn: api.org.departments });
  const staff = useQuery({ queryKey: ['people', ''], queryFn: () => api.employees.list({ status: 'ACTIVE' }) });
  const [f, setF] = useState({
    name: employee?.name || '', email: employee?.email || '', phone: employee?.phone || '', designation: employee?.designation || '',
    deptId: employee?.deptId || '', managerId: employee?.managerId || '', role: employee?.role || 'EMPLOYEE',
    joinDate: employee?.joinDate || new Date().toISOString().slice(0, 10), status: employee?.status || 'ACTIVE',
    basic: employee?.salary?.basic ?? '', hra: employee?.salary?.hra ?? '', allowances: employee?.salary?.allowances ?? '',
    bankAccount: '', nationalId: '',
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const m = useMutation({
    mutationFn: () => {
      const salary = { basic: Number(f.basic) || 0, hra: Number(f.hra) || 0, allowances: Number(f.allowances) || 0 };
      const base = { name: f.name, phone: f.phone || undefined, designation: f.designation, deptId: f.deptId, managerId: f.managerId || (edit ? null : undefined) };
      if (edit) {
        const body = { ...base, status: f.status };
        if (admin) Object.assign(body, { role: f.role, salary, ...(f.bankAccount && { bankAccount: f.bankAccount }), ...(f.nationalId && { nationalId: f.nationalId }) });
        return api.employees.update(employee.empId, body);
      }
      return api.employees.create({ ...base, email: f.email, role: f.role, joinDate: f.joinDate, salary, bankAccount: f.bankAccount || undefined, nationalId: f.nationalId || undefined });
    },
    onSuccess: (r) => { ['people', 'employee', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success(edit ? 'Profile saved.' : `${f.name} was added.`); onCreated?.(r); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const valid = f.name.trim().length > 1 && f.designation.trim().length > 1 && f.deptId && (edit || /\S+@\S+\.\S+/.test(f.email));

  return (
    <Modal open onClose={onClose} title={edit ? 'Edit profile' : 'Add a person'} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={m.isPending} disabled={!valid} onClick={() => m.mutate()}>{edit ? 'Save changes' : 'Add person'}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={f.name} onChange={set('name')} /></Field>
        <Field label="Work email"><Input type="email" value={f.email} onChange={set('email')} disabled={edit} /></Field>
        <Field label="Job title"><Input value={f.designation} onChange={set('designation')} /></Field>
        <Field label="Phone"><Input value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Department"><Select value={f.deptId} onChange={set('deptId')}><option value="">Choose</option>{depts.data?.map((d) => <option key={d.deptId} value={d.deptId}>{d.name}</option>)}</Select></Field>
        <Field label="Reports to"><Select value={f.managerId} onChange={set('managerId')}><option value="">No one</option>{staff.data?.filter((s) => s.empId !== employee?.empId).map((s) => <option key={s.empId} value={s.empId}>{s.name}</option>)}</Select></Field>
        {!edit && <Field label="Joining date"><Input type="date" value={f.joinDate} onChange={set('joinDate')} /></Field>}
        {edit && <Field label="Status"><Select value={f.status} onChange={set('status')}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive (cannot sign in)</option></Select></Field>}
        {(admin || !edit) && <Field label="Access role"><Select value={f.role} disabled={!admin} onChange={set('role')}>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</Select></Field>}
      </div>
      {(admin || !edit) && (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="mb-3 text-[15px] font-semibold">Pay and identity</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Basic (monthly)"><Input type="number" min="0" value={f.basic} onChange={set('basic')} /></Field>
            <Field label="HRA (monthly)"><Input type="number" min="0" value={f.hra} onChange={set('hra')} /></Field>
            <Field label="Allowances (monthly)"><Input type="number" min="0" value={f.allowances} onChange={set('allowances')} /></Field>
            <Field label="Bank account" hint={edit ? 'Leave blank to keep the current one.' : 'Encrypted before it is stored.'} className="sm:col-span-2"><Input value={f.bankAccount} onChange={set('bankAccount')} autoComplete="off" /></Field>
            <Field label="National ID" hint="Encrypted before it is stored."><Input value={f.nationalId} onChange={set('nationalId')} autoComplete="off" /></Field>
          </div>
        </div>
      )}
    </Modal>
  );
}

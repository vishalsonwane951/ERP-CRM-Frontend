import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { Badge, Button, ErrorNote, Modal, Spinner, StatusBadge, Tabs } from '../../components/ui.jsx';
import { ATT_STATUS, REQ_STATUS, fmtDate, fmtTime, hm, monthLabel, shiftMonth, todayISO } from '../../lib/format.js';

const TASK = { TODO: { label: 'To do', tone: 'neutral' }, IN_PROGRESS: { label: 'In progress', tone: 'saffron' }, DONE: { label: 'Done', tone: 'moss' } };

/** One person's month of attendance, their leave requests and their tasks. Used by managers and project managers. */
export default function EmployeeDrill({ person, onClose }) {
  const [tab, setTab] = useState('attendance');
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const q = useQuery({ queryKey: ['team-emp', person.empId, month], queryFn: () => api.team.employee(person.empId, month) });
  return (
    <Modal open onClose={onClose} title={person.name} sub={person.designation} size="lg"
      footer={<><Link to={`/people/${person.empId}`} className="mr-auto text-[14px] font-semibold text-peacock-700 hover:underline">Open full profile</Link><Button variant="secondary" onClick={onClose}>Close</Button></>}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'attendance', label: 'Attendance' }, { id: 'leave', label: 'Leave' }, { id: 'tasks', label: 'Tasks' }]} />
        {tab === 'attendance' && (
          <div className="flex items-center gap-1"><Button size="sm" variant="secondary" onClick={() => setMonth(shiftMonth(month, -1))}>Previous</Button>
            <span className="px-2 text-[14px] font-semibold">{monthLabel(month)}</span>
            <Button size="sm" variant="secondary" disabled={month >= todayISO().slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}>Next</Button></div>
        )}
      </div>
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : (
        <>
          {tab === 'attendance' && (
            <>
              <p className="mb-3 text-[13.5px] text-mute">{q.data.attendance.summary.present} on time · {q.data.attendance.summary.late} late · {q.data.attendance.summary.halfDay} half days</p>
              {!q.data.attendance.records.length ? <p className="text-[14px] text-mute">No attendance this month.</p> : (
                <table className="tbl"><thead><tr><th>Date</th><th>Status</th><th>In</th><th>Out</th><th className="text-right">Worked</th></tr></thead>
                  <tbody>{q.data.attendance.records.map((r) => <tr key={r.date}><td>{fmtDate(r.date)}</td><td><StatusBadge map={ATT_STATUS} value={r.status} /></td><td>{fmtTime(r.checkInAt)}</td><td>{fmtTime(r.checkOutAt)}</td><td className="text-right tabular-nums">{hm(r.workedMinutes)}</td></tr>)}</tbody></table>
              )}
            </>
          )}
          {tab === 'leave' && (!q.data.leaves.length ? <p className="text-[14px] text-mute">No leave requests.</p> : (
            <table className="tbl"><thead><tr><th>Type</th><th>Dates</th><th className="text-right">Days</th><th>Status</th></tr></thead>
              <tbody>{q.data.leaves.map((l) => <tr key={l.reqId}><td>{l.typeName}</td><td>{fmtDate(l.from)}{l.to !== l.from && ` to ${fmtDate(l.to)}`}</td><td className="text-right tabular-nums">{l.days}</td><td><StatusBadge map={REQ_STATUS} value={l.status} /></td></tr>)}</tbody></table>
          ))}
          {tab === 'tasks' && (!q.data.tasks.length ? <p className="text-[14px] text-mute">No tasks assigned.</p> : (
            <table className="tbl"><thead><tr><th>Task</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>{q.data.tasks.map((t) => <tr key={t.taskId}><td>{t.title}</td><td>{fmtDate(t.dueDate)}{t.overdue && <span className="ml-2 text-[12.5px] font-semibold text-lotus-600">overdue</span>}</td><td><Badge tone={TASK[t.status].tone}>{TASK[t.status].label}</Badge></td></tr>)}</tbody></table>
          ))}
        </>
      )}
    </Modal>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Card, CardHeader, Empty, ErrorNote, PageHeader, Spinner, Tabs } from '../../components/ui.jsx';
import AttendanceTrend from './AttendanceTrend.jsx';
import { fmtDateTime, ROLE_LABEL } from '../../lib/format.js';

const ACTION = (a) => a.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

function AuditLog() {
  const q = useQuery({ queryKey: ['audit'], queryFn: api.reports.audit });
  return (
    <Card>
      <CardHeader title="Audit trail" sub="Every sensitive change, newest first. Entries cannot be edited." />
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.length ? <Empty title="No activity recorded yet" /> : (
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>When</th><th>Who</th><th>What</th><th>Record</th></tr></thead>
          <tbody>{q.data.map((a) => <tr key={a.SK || a.at + a.entityId}><td className="whitespace-nowrap">{fmtDateTime(a.at)}</td><td>{a.actorName}<span className="ml-2 text-[12.5px] text-mute">{ROLE_LABEL[a.actorRole]}</span></td><td><Badge tone="teal" dot={false}>{ACTION(a.action)}</Badge></td><td className="max-w-[220px] truncate text-mute">{a.entityType} {String(a.entityId).split('_')[0]}</td></tr>)}</tbody></table></div>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  const { is } = useAuth(); const [days, setDays] = useState('14');
  return (
    <>
      <PageHeader title="Reports" sub="Read from pre-aggregated figures, so they never slow down check-ins." />
      <div className="space-y-5">
        <Card>
          <CardHeader title="Attendance by day" sub="Weekdays only" action={<Tabs value={days} onChange={setDays} tabs={[{ id: '14', label: '2 weeks' }, { id: '30', label: '30 days' }, { id: '60', label: '60 days' }]} />} />
          <AttendanceTrend days={Number(days)} height={300} />
        </Card>
        {is('HR_ADMIN', 'AUDITOR') && <AuditLog />}
      </div>
    </>
  );
}

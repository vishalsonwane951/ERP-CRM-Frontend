import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { Badge, Card, CardHeader, Empty, ErrorNote, PageHeader, Select, Spinner } from '../../components/ui.jsx';
import { fmtDateTime, ROLE_LABEL } from '../../lib/format.js';

const ACTION = (a) => a.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

// Audit trail of one organization, picked from the list. "platform" = the platform team's own actions.
export default function AuditLogs() {
  const [orgId, setOrgId] = useState('platform');
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: api.platform.orgs });
  const q = useQuery({ queryKey: ['platform-audit', orgId], queryFn: () => api.platform.audit(orgId) });
  return (
    <>
      <PageHeader title="Audit logs" sub="Newest first. Entries cannot be edited." actions={
        <Select value={orgId} onChange={(e) => setOrgId(e.target.value)} aria-label="Organization">
          <option value="platform">Platform</option>
          {orgs.data?.map((o) => <option key={o.orgId} value={o.orgId}>{o.name}</option>)}
        </Select>} />
      <Card>
        <CardHeader title={orgId === 'platform' ? 'Platform activity' : `Activity in ${orgs.data?.find((o) => o.orgId === orgId)?.name || orgId}`} />
        {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.length ? <Empty title="No activity recorded yet" /> : (
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>When</th><th>Who</th><th>What</th><th>Record</th></tr></thead>
            <tbody>{q.data.map((a) => <tr key={a.auditId}><td className="whitespace-nowrap">{fmtDateTime(a.at)}</td><td>{a.actorName}<span className="ml-2 text-[12.5px] text-mute">{ROLE_LABEL[a.actorRole]}</span></td><td><Badge tone="teal">{ACTION(a.action)}</Badge></td><td className="max-w-[220px] truncate text-mute">{a.entityType} {a.entityId}</td></tr>)}</tbody></table></div>
        )}
      </Card>
    </>
  );
}

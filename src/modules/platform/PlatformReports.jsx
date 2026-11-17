import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { Badge, Card, CardHeader, ErrorNote, PageHeader, Spinner, Stat } from '../../components/ui.jsx';
import { money } from '../../lib/format.js';

// Read-only money view (platform FINANCE and SUPER_ADMIN)
export default function PlatformReports() {
  const q = useQuery({ queryKey: ['platform-reports'], queryFn: api.platform.reports });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const d = q.data;
  return (
    <>
      <PageHeader title="Revenue" sub={d.note} />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Monthly revenue" value={money(d.monthlyRevenue)} hero /></div>
      <div className="space-y-5">
        <Card><CardHeader title="By plan" />
          <table className="tbl"><thead><tr><th>Plan</th><th>Price</th><th>Active organizations</th><th>Monthly revenue</th></tr></thead>
            <tbody>{d.byPlan.map((p) => <tr key={p.planId}><td>{p.name}</td><td>{money(p.price)}</td><td>{p.organizations}</td><td>{money(p.monthlyRevenue)}</td></tr>)}</tbody></table></Card>
        <Card><CardHeader title="By organization" />
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Organization</th><th>Plan</th><th>Price</th><th>People</th><th>Status</th></tr></thead>
            <tbody>{d.organizations.map((o) => <tr key={o.orgId}><td>{o.name}</td><td>{o.planName || '–'}</td><td>{money(o.price)}</td><td>{o.employeeCount}</td><td><Badge tone={o.status === 'SUSPENDED' ? 'lotus' : 'moss'}>{o.status === 'SUSPENDED' ? 'Suspended' : 'Active'}</Badge></td></tr>)}</tbody></table></div></Card>
      </div>
    </>
  );
}

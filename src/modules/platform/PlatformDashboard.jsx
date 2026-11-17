import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { Card, CardHeader, Empty, ErrorNote, PageHeader, Spinner, Stat } from '../../components/ui.jsx';

export default function PlatformDashboard() {
  const q = useQuery({ queryKey: ['platform-dashboard'], queryFn: api.platform.dashboard });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  const d = q.data;
  return (
    <>
      <PageHeader title="Platform overview" sub="All organizations on Muster." />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Organizations" value={d.organizations.total} hero />
        <Stat label="Active" value={d.organizations.active} tone="moss" />
        <Stat label="Suspended" value={d.organizations.suspended} tone={d.organizations.suspended ? 'lotus' : undefined} />
        <Stat label="People" value={d.employees} sub="active employees, all organizations" />
      </div>
      <Card>
        <CardHeader title="Organizations by plan" sub={`${d.activePlans} active plans`} />
        {!d.byPlan.length ? <Empty title="No plans yet" hint="Create one on the Plans page." /> : (
          <table className="tbl"><thead><tr><th>Plan</th><th>Active organizations</th></tr></thead>
            <tbody>{d.byPlan.map((p) => <tr key={p.planId}><td>{p.name}</td><td>{p.organizations}</td></tr>)}</tbody></table>
        )}
      </Card>
    </>
  );
}

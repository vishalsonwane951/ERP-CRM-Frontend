import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, useToast } from '../../components/ui.jsx';
import { FEATURES, FeatureToggles } from './features.jsx';

// Plan + feature switches of one organization. Picking a plan loads that plan's features; they can then be adjusted before saving.
function ManageModal({ org, plans, onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const [planId, setPlanId] = useState(org.planId || '');
  const [flags, setFlags] = useState(org.features);
  const pickPlan = (id) => {
    setPlanId(id);
    const plan = plans.find((p) => p.planId === id);
    if (plan) setFlags(Object.fromEntries(FEATURES.map((f) => [f.key, plan.features.includes(f.key)])));
  };
  const save = useMutation({
    mutationFn: async () => {
      if (planId && planId !== org.planId) await api.platform.setPlan(org.orgId, planId); // sets the plan's features first
      await api.platform.setFeatures(org.orgId, flags); // then applies any single switches changed here
    },
    onSuccess: () => { toast.success(`${org.name} updated`); qc.invalidateQueries({ queryKey: ['platform-orgs'] }); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title={org.name} sub={`Organization id: ${org.orgId}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Save</Button></>}>
      <div className="space-y-5">
        <Field label="Plan">
          <Select value={planId} onChange={(e) => pickPlan(e.target.value)}>
            <option value="">No plan</option>
            {plans.map((p) => <option key={p.planId} value={p.planId}>{p.name} ({p.maxEmployees} people)</option>)}
          </Select>
        </Field>
        <div><p className="mb-2 text-[13.5px] font-semibold">Features</p><FeatureToggles value={flags} onChange={setFlags} /></div>
      </div>
    </Modal>
  );
}

function CreateModal({ plans, onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const [f, setF] = useState({ name: '', planId: plans[0]?.planId || '', adminName: '', adminEmail: '' });
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const create = useMutation({
    mutationFn: () => api.platform.createOrg({ ...f, adminName: f.adminName || undefined, adminEmail: f.adminEmail || undefined }),
    onSuccess: (r) => { setDone(r); qc.invalidateQueries({ queryKey: ['platform-orgs'] }); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title="New organization"
      footer={done ? <Button onClick={onClose}>Done</Button> : <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={create.isPending} disabled={!f.name || !f.planId} onClick={() => create.mutate()}>Create</Button></>}>
      {done ? (
        <div className="space-y-2 text-[14px]">
          <p><b>{done.organization.name}</b> was created (id <code>{done.organization.orgId}</code>).</p>
          {done.tempPassword && <p>First HR admin: <b>{f.adminEmail}</b><br />Temporary password: <code>{done.tempPassword}</code>. Share it once; they should change it.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Organization name"><Input value={f.name} onChange={set('name')} /></Field>
          <Field label="Plan"><Select value={f.planId} onChange={set('planId')}>{plans.map((p) => <option key={p.planId} value={p.planId}>{p.name}</option>)}</Select></Field>
          <Field label="First HR admin (optional)" hint="Creates a sign-in so the company can start. Leave empty to add one later.">
            <div className="grid gap-2 sm:grid-cols-2"><Input placeholder="Name" value={f.adminName} onChange={set('adminName')} /><Input type="email" placeholder="Email" value={f.adminEmail} onChange={set('adminEmail')} /></div>
          </Field>
        </div>
      )}
    </Modal>
  );
}

export default function Organizations() {
  const { is } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: api.platform.orgs });
  const plans = useQuery({ queryKey: ['platform-plans'], queryFn: api.platform.plans });
  const [manage, setManage] = useState(null); const [creating, setCreating] = useState(false);
  const canCreate = is('SUPER_ADMIN'); // SALES can change plans and features, not create or suspend

  const toggle = useMutation({
    mutationFn: (o) => (o.status === 'SUSPENDED' ? api.platform.reactivateOrg(o.orgId) : api.platform.suspendOrg(o.orgId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-orgs'] }),
    onError: (e) => toast.error(e.message),
  });

  if (orgs.isLoading || plans.isLoading) return <Spinner />;
  if (orgs.error || plans.error) return <ErrorNote error={orgs.error || plans.error} retry={() => { orgs.refetch(); plans.refetch(); }} />;
  return (
    <>
      <PageHeader title="Organizations" sub="Plans and feature switches for every company." actions={canCreate && <Button onClick={() => setCreating(true)} disabled={!plans.data.length}>New organization</Button>} />
      <Card>
        {!orgs.data.length ? <Empty title="No organizations yet" /> : (
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Organization</th><th>Plan</th><th>People</th><th>Features on</th><th>Status</th><th /></tr></thead>
            <tbody>{orgs.data.map((o) => (
              <tr key={o.orgId}>
                <td>{o.name}<span className="ml-2 text-[12.5px] text-mute">{o.orgId}</span></td>
                <td>{o.planName || '–'}</td>
                <td>{o.employeeCount}{o.maxEmployees ? ` / ${o.maxEmployees}` : ''}</td>
                <td className="text-[13px] text-mute">{FEATURES.filter((f) => o.features[f.key]).map((f) => f.key).join(', ') || 'none'}</td>
                <td><Badge tone={o.status === 'SUSPENDED' ? 'lotus' : 'moss'}>{o.status === 'SUSPENDED' ? 'Suspended' : 'Active'}</Badge></td>
                <td className="whitespace-nowrap text-right">
                  <Button size="sm" variant="secondary" onClick={() => setManage(o)}>Manage</Button>{' '}
                  {canCreate && <Button size="sm" variant={o.status === 'SUSPENDED' ? 'success' : 'dangerSoft'} loading={toggle.isPending && toggle.variables?.orgId === o.orgId} onClick={() => toggle.mutate(o)}>{o.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}</Button>}
                </td>
              </tr>
            ))}</tbody></table></div>
        )}
      </Card>
      {manage && <ManageModal org={manage} plans={plans.data} onClose={() => setManage(null)} />}
      {creating && <CreateModal plans={plans.data} onClose={() => setCreating(false)} />}
    </>
  );
}

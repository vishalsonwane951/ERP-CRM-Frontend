import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, useToast } from '../../components/ui.jsx';
import { money } from '../../lib/format.js';
import { FEATURES, FeatureToggles } from './features.jsx';

const toFlags = (list = []) => Object.fromEntries(FEATURES.map((f) => [f.key, list.includes(f.key)]));

function PlanModal({ plan, onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const [f, setF] = useState({ name: plan?.name || '', price: plan?.price ?? '', maxEmployees: plan?.maxEmployees ?? '', status: plan?.status || 'ACTIVE' });
  const [flags, setFlags] = useState(toFlags(plan?.features));
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = useMutation({
    mutationFn: () => {
      const body = { ...f, features: FEATURES.filter((x) => flags[x.key]).map((x) => x.key) };
      return plan ? api.platform.updatePlan(plan.planId, body) : api.platform.createPlan(body);
    },
    onSuccess: () => { toast.success('Plan saved'); qc.invalidateQueries({ queryKey: ['platform-plans'] }); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title={plan ? `Edit ${plan.name}` : 'New plan'} sub={plan && 'Organizations already on this plan keep their current features until the plan is assigned again.'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={!f.name || f.price === '' || !f.maxEmployees} onClick={() => save.mutate()}>Save</Button></>}>
      <div className="space-y-4">
        <Field label="Name"><Input value={f.name} onChange={set('name')} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Price per month (INR)"><Input type="number" min="0" value={f.price} onChange={set('price')} /></Field>
          <Field label="Max employees"><Input type="number" min="1" value={f.maxEmployees} onChange={set('maxEmployees')} /></Field>
        </div>
        {plan && <Field label="Status"><Select value={f.status} onChange={set('status')}><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></Select></Field>}
        <div><p className="mb-2 text-[13.5px] font-semibold">Features included</p><FeatureToggles value={flags} onChange={setFlags} /></div>
      </div>
    </Modal>
  );
}

export default function Plans() {
  const { is } = useAuth();
  const q = useQuery({ queryKey: ['platform-plans'], queryFn: api.platform.plans });
  const [editing, setEditing] = useState(null); // null = closed, {} = new, plan = edit
  const canEdit = is('SUPER_ADMIN', 'SALES'); // platform FINANCE can only read
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorNote error={q.error} retry={q.refetch} />;
  return (
    <>
      <PageHeader title="Plans" sub="Price, headcount limit and features of each plan." actions={canEdit && <Button onClick={() => setEditing({})}>New plan</Button>} />
      <Card>
        {!q.data.length ? <Empty title="No plans yet" /> : (
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Plan</th><th>Price / month</th><th>Max people</th><th>Features</th><th>Status</th>{canEdit && <th />}</tr></thead>
            <tbody>{q.data.map((p) => (
              <tr key={p.planId}><td>{p.name}</td><td>{money(p.price)}</td><td>{p.maxEmployees}</td>
                <td className="text-[13px] text-mute">{p.features.join(', ') || 'none'}</td>
                <td><Badge tone={p.status === 'ARCHIVED' ? 'neutral' : 'moss'}>{p.status === 'ARCHIVED' ? 'Archived' : 'Active'}</Badge></td>
                {canEdit && <td className="text-right"><Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Edit</Button></td>}</tr>
            ))}</tbody></table></div>
        )}
      </Card>
      {editing && <PlanModal plan={editing.planId ? editing : null} onClose={() => setEditing(null)} />}
    </>
  );
}

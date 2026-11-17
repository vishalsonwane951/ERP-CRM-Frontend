import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Laptop, Plus } from 'lucide-react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Modal, PageHeader, Select, Spinner, useToast } from '../../components/ui.jsx';
import { fmtDate, fmtDateTime, money } from '../../lib/format.js';

const CATS = ['Laptop', 'Phone', 'Monitor', 'Accessory', 'Furniture', 'Other'];

function AddAsset({ onClose }) {
  const toast = useToast(); const qc = useQueryClient();
  const [f, setF] = useState({ tag: '', name: '', category: 'Laptop', serial: '', value: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const m = useMutation({ mutationFn: () => api.assets.create({ ...f, serial: f.serial || undefined, value: f.value ? Number(f.value) : undefined }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); toast.success('Asset added.'); onClose(); }, onError: (e) => toast.error(e.message) });
  return (
    <Modal open onClose={onClose} title="Add equipment" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={m.isPending} disabled={f.tag.length < 2 || f.name.length < 2} onClick={() => m.mutate()}>Add equipment</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Asset tag"><Input value={f.tag} onChange={set('tag')} placeholder="KL-LT-0150" /></Field>
        <Field label="Category"><Select value={f.category} onChange={set('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Name" className="sm:col-span-2"><Input value={f.name} onChange={set('name')} /></Field>
        <Field label="Serial number"><Input value={f.serial} onChange={set('serial')} /></Field>
        <Field label="Value (INR)"><Input type="number" min="0" value={f.value} onChange={set('value')} /></Field>
      </div>
    </Modal>
  );
}

function AssignModal({ asset, onClose }) {
  const toast = useToast(); const qc = useQueryClient(); const [empId, setEmpId] = useState('');
  const staff = useQuery({ queryKey: ['people', ''], queryFn: () => api.employees.list({ status: 'ACTIVE' }) });
  const m = useMutation({ mutationFn: () => api.assets.assign(asset.assetId, { empId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); toast.success('Assigned.'); onClose(); }, onError: (e) => toast.error(e.message) });
  return (
    <Modal open onClose={onClose} title={`Assign ${asset.name}`} sub={asset.tag} size="sm" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={m.isPending} disabled={!empId} onClick={() => m.mutate()}>Assign</Button></>}>
      <Field label="Give to"><Select value={empId} onChange={(e) => setEmpId(e.target.value)}><option value="">Choose a person</option>{staff.data?.map((s) => <option key={s.empId} value={s.empId}>{s.name}</option>)}</Select></Field>
    </Modal>
  );
}

function History({ asset, onClose }) {
  const q = useQuery({ queryKey: ['asset-hist', asset.assetId], queryFn: () => api.assets.history(asset.assetId) });
  return (
    <Modal open onClose={onClose} title="Assignment history" sub={`${asset.name} · ${asset.tag}`} side>
      {q.isLoading ? <Spinner /> : !q.data?.length ? <Empty title="Never assigned" /> : <ul className="space-y-3">{q.data.map((h) => <li key={h.at} className="border-b border-line/70 pb-3 last:border-0"><p className="text-[14px] font-semibold">{h.action === 'ASSIGNED' ? 'Given to' : 'Returned by'} {h.empName}</p><p className="text-[13px] text-mute">{fmtDateTime(h.at)} · by {h.by}</p></li>)}</ul>}
    </Modal>
  );
}

export default function AssetsPage() {
  const { isHR, is } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const [adding, setAdding] = useState(false); const [assign, setAssign] = useState(null); const [hist, setHist] = useState(null);
  const q = useQuery({ queryKey: ['assets'], queryFn: api.assets.list });
  const back = useMutation({ mutationFn: (id) => api.assets.giveBack(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); toast.success('Marked as returned.'); }, onError: (e) => toast.error(e.message) });
  const tone = { AVAILABLE: 'moss', ASSIGNED: 'teal', RETIRED: 'neutral' };
  return (
    <>
      <PageHeader title={isHR ? 'Equipment' : 'My equipment'} sub={isHR ? 'Company inventory and who has what.' : 'Devices and gear assigned to you.'} actions={isHR && <Button icon={Plus} onClick={() => setAdding(true)}>Add equipment</Button>} />
      <Card>
        {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.length ? <Empty icon={Laptop} title={isHR ? 'No equipment yet' : 'Nothing assigned to you'} hint={isHR ? 'Add laptops, phones and other gear to track who has them.' : 'When HR gives you a device it will be listed here.'} /> : (
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Item</th><th>Tag</th><th>Status</th><th>With</th><th className="text-right">Value</th>{isHR && <th />}</tr></thead>
            <tbody>{q.data.map((a) => (
              <tr key={a.assetId}><td><p className="font-semibold">{a.name}</p><p className="text-[12.5px] text-mute">{a.category}{a.serial && ` · ${a.serial}`}</p></td><td>{a.tag}</td>
                <td><Badge tone={tone[a.status]}>{a.status === 'AVAILABLE' ? 'Available' : a.status === 'ASSIGNED' ? 'Assigned' : 'Retired'}</Badge></td>
                <td>{a.assignedToName || '–'}{a.assignedAt && <span className="block text-[12.5px] text-mute">since {fmtDate(a.assignedAt)}</span>}</td><td className="text-right tabular-nums">{money(a.value)}</td>
                {isHR && <td className="text-right"><div className="flex justify-end gap-1">
                  {a.status === 'AVAILABLE' && <Button size="sm" variant="secondary" onClick={() => setAssign(a)}>Assign</Button>}
                  {a.status === 'ASSIGNED' && <Button size="sm" variant="secondary" loading={back.isPending && back.variables === a.assetId} onClick={() => back.mutate(a.assetId)}>Mark returned</Button>}
                  {is('HR_ADMIN', 'HR_MANAGER') && <Button size="sm" variant="ghost" onClick={() => setHist(a)}>History</Button>}</div></td>}
              </tr>))}
            </tbody></table></div>
        )}
      </Card>
      {adding && <AddAsset onClose={() => setAdding(false)} />}{assign && <AssignModal asset={assign} onClose={() => setAssign(null)} />}{hist && <History asset={hist} onClose={() => setHist(null)} />}
    </>
  );
}

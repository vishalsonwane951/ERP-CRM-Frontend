import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Upload } from 'lucide-react';
import { api } from '../../api/index.js';
import { Badge, Button, Empty, ErrorNote, Select, Spinner, useToast } from '../../components/ui.jsx';
import { fmtDate } from '../../lib/format.js';

const CATS = { identity: 'Identity', bank: 'Bank', 'offer-letters': 'Offer letters', payslips: 'Payslips', certificates: 'Certificates', contracts: 'Contracts', assets: 'Assets' };
const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Upload = presigned PUT straight to S3, then confirm. Bytes never pass through Express (v3 §6.2). */
export default function DocumentsPanel({ employeeId, canUploadAll }) {
  const toast = useToast(); const qc = useQueryClient(); const file = useRef(null);
  const [cat, setCat] = useState(canUploadAll ? 'offer-letters' : 'identity');
  const q = useQuery({ queryKey: ['docs', employeeId || 'me'], queryFn: () => api.documents.list(employeeId) });
  const options = canUploadAll ? Object.keys(CATS) : ['identity', 'certificates'];

  const upload = useMutation({
    mutationFn: async (f) => {
      const body = { employeeId, category: cat, filename: f.name, contentType: f.type };
      const slot = await api.documents.uploadUrl(body);
      const put = await fetch(slot.uploadUrl, { method: 'PUT', headers: slot.headers, body: f });
      if (!put.ok) throw new Error('The upload to storage failed. Try again.');
      return api.documents.confirm({ documentId: slot.documentId, employeeId, category: cat, filename: f.name, key: slot.key });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['docs'] }); toast.success('Document uploaded.'); },
    onError: (e) => toast.error(e.message),
  });
  const pick = (e) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (f.size > 10 * 1048576) return toast.error('Files can be up to 10 MB.');
    if (!['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)) return toast.error('Upload a PDF, PNG, JPG or Word file.');
    upload.mutate(f);
  };
  const open = async (d) => {
    try { const r = await api.documents.downloadUrl(d.documentId, employeeId); window.open(r.url, '_blank', 'noopener'); } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="input !w-auto" aria-label="Category">{options.map((c) => <option key={c} value={c}>{CATS[c]}</option>)}</Select>
        <input ref={file} type="file" hidden onChange={pick} accept=".pdf,.png,.jpg,.jpeg,.docx" />
        <Button icon={Upload} variant="secondary" loading={upload.isPending} onClick={() => file.current.click()}>Upload file</Button>
        <span className="text-[13px] text-mute">PDF, image or Word, up to 10 MB.</span>
      </div>
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.length ? <Empty icon={FileText} title="No documents yet" hint="Uploaded files are stored privately and open through a link that expires in two minutes." /> : (
        <ul>{q.data.map((d) => (
          <li key={d.documentId} className="flex items-center gap-3 border-b border-line/70 px-5 py-3 last:border-0">
            <FileText className="h-5 w-5 shrink-0 text-peacock-600" />
            <div className="min-w-0 flex-1"><p className="truncate text-[14.5px] font-semibold">{d.filename}</p><p className="text-[13px] text-mute">{kb(d.size)} · {fmtDate(d.uploadedAt)} · {d.uploadedBy}</p></div>
            <Badge tone="teal" dot={false}>{CATS[d.category]}</Badge>
            <Button variant="ghost" size="sm" icon={Download} onClick={() => open(d)}>Open</Button>
          </li>))}
        </ul>
      )}
    </div>
  );
}

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../../api/index.js';
import { useToast } from '../../components/ui.jsx';

/** Opens the bill through a link that expires in two minutes. ownerId = who the claim belongs to (empty = me). */
export default function ViewBill({ documentId, ownerId, label = 'View bill' }) {
  const toast = useToast(); const [busy, setBusy] = useState(false);
  if (!documentId) return <span className="text-mute">–</span>;
  const open = async (e) => {
    e.stopPropagation(); setBusy(true);
    try { const r = await api.documents.downloadUrl(documentId, ownerId); window.open(r.url, '_blank', 'noopener'); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return <button onClick={open} disabled={busy} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-peacock-700 hover:underline"><FileText className="h-4 w-4" aria-hidden />{label}</button>;
}

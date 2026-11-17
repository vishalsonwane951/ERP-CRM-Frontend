import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Upload } from 'lucide-react';
import { publicApi } from '../../api/public.js';
import { Button, Card, ErrorNote, Field, Input, Spinner, Textarea } from '../../components/ui.jsx';
import { ALLOWED_TYPES, MAX_MB } from '../../lib/upload.js';

const DOCS = [
  { category: 'identity', label: 'Identity proof (required)', hint: 'Passport, driving licence, national ID' },
  { category: 'bank', label: 'Bank proof', hint: 'Cancelled cheque or first page of the passbook' },
  { category: 'certificates', label: 'Certificates', hint: 'Degrees, previous employment letters' },
];

function DocRow({ token, doc, files, onChange }) {
  const input = useRef(null); const [error, setError] = useState('');
  const upload = useMutation({
    mutationFn: async (file) => {
      const slot = await publicApi.uploadUrl(token, { category: doc.category, filename: file.name, contentType: file.type });
      const put = await fetch(slot.uploadUrl, { method: 'PUT', headers: slot.headers, body: file });
      if (!put.ok) throw new Error('The upload failed. Please try again.');
      return publicApi.confirm(token, { documentId: slot.documentId, category: doc.category, filename: file.name, key: slot.key });
    },
    onSuccess: () => { setError(''); onChange(); },
    onError: (e) => setError(e.message),
  });
  const pick = (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > MAX_MB * 1048576) return setError(`Files can be up to ${MAX_MB} MB.`);
    if (!ALLOWED_TYPES.includes(file.type)) return setError('Please upload a PDF, PNG or JPG.');
    upload.mutate(file);
  };
  return (
    <div className="rounded-ctl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-[14px] font-semibold">{doc.label}</p><p className="text-[12.5px] text-mute">{doc.hint}. PDF, PNG or JPG, up to {MAX_MB} MB.</p></div>
        <input ref={input} type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={pick} />
        <Button type="button" size="sm" variant="secondary" icon={Upload} loading={upload.isPending} onClick={() => input.current.click()}>Upload</Button>
      </div>
      {files.length > 0 && <ul className="mt-2 space-y-0.5 text-[13.5px] text-moss-700">{files.map((f) => <li key={f.documentId}>✓ {f.filename}</li>)}</ul>}
      {error && <p role="alert" className="mt-2 text-[13px] text-lotus-700">{error}</p>}
    </div>
  );
}

/** The page a candidate opens from the emailed link. No account and no sign-in: the long token in the address is the key. */
export default function OnboardPage({ token }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['onboard', token], queryFn: () => publicApi.show(token), retry: false });
  const [f, setF] = useState({ phone: '', dob: '', address: '', emergencyName: '', emergencyPhone: '', bankName: '', bankIfsc: '', bankAccount: '', nationalId: '' });
  const [error, setError] = useState(''); const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = useMutation({ mutationFn: () => publicApi.submit(token, Object.fromEntries(Object.entries(f).filter(([, v]) => v.trim()))), onSuccess: () => setSent(true), onError: (e) => setError(e.message) });

  const shell = (children) => <main className="mx-auto max-w-2xl px-4 py-10">{children}</main>;
  if (q.isLoading) return shell(<Spinner />);
  if (q.error) return shell(<Card className="p-8 text-center"><h1 className="mb-2 text-[20px] font-bold">This link cannot be used</h1><p className="text-[14.5px] text-mute">{q.error.message}</p></Card>);
  const d = q.data;
  if (sent || d.status !== 'SENT') return shell(<Card className="p-8 text-center"><CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-moss-600" aria-hidden /><h1 className="mb-2 text-[20px] font-bold">Thank you, {d.name.split(' ')[0]}</h1><p className="text-[14.5px] text-mute">Your details were sent to {d.orgName}. HR will review them and be in touch.</p></Card>);

  const byCat = (c) => d.documents.filter((x) => x.category === c);
  const required = ['phone', 'address', 'bankAccount', 'bankIfsc', 'nationalId'].every((k) => f[k].trim()) && byCat('identity').length > 0;
  return shell(
    <>
      <h1 className="text-[24px] font-bold">Welcome to {d.orgName}</h1>
      <p className="mb-6 mt-1 text-[14.5px] text-mute">Hello {d.name}. Please complete your joining details. You can only send this form once.</p>
      <div className="space-y-5">
        <Card className="space-y-4 p-5">
          <h2 className="text-[16px] font-bold">About you</h2>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Phone"><Input value={f.phone} onChange={set('phone')} /></Field><Field label="Date of birth"><Input type="date" value={f.dob} onChange={set('dob')} /></Field></div>
          <Field label="Home address"><Textarea value={f.address} onChange={set('address')} /></Field>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Emergency contact name"><Input value={f.emergencyName} onChange={set('emergencyName')} /></Field><Field label="Emergency contact phone"><Input value={f.emergencyPhone} onChange={set('emergencyPhone')} /></Field></div>
          <Field label="National ID number"><Input value={f.nationalId} onChange={set('nationalId')} /></Field>
        </Card>
        <Card className="space-y-4 p-5">
          <h2 className="text-[16px] font-bold">Bank details for salary</h2>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Bank name"><Input value={f.bankName} onChange={set('bankName')} /></Field><Field label="IFSC code"><Input value={f.bankIfsc} onChange={set('bankIfsc')} /></Field></div>
          <Field label="Account number"><Input inputMode="numeric" value={f.bankAccount} onChange={set('bankAccount')} /></Field>
        </Card>
        <Card className="space-y-3 p-5">
          <h2 className="text-[16px] font-bold">Documents</h2>
          {DOCS.map((doc) => <DocRow key={doc.category} token={token} doc={doc} files={byCat(doc.category)} onChange={() => qc.invalidateQueries({ queryKey: ['onboard', token] })} />)}
        </Card>
        {error && <p role="alert" className="text-[14px] text-lotus-700">{error}</p>}
        <Button size="lg" className="w-full" loading={submit.isPending} disabled={!required} onClick={() => { setError(''); submit.mutate(); }}>Send my details</Button>
        {!required && <p className="text-center text-[12.5px] text-mute">Phone, address, national ID, bank details and one identity document are required.</p>}
      </div>
    </>,
  );
}

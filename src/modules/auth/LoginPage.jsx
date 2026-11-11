import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Field, Input } from '../../components/ui.jsx';

const DEMO = [
  ['Meera Iyer', 'HR admin', 'meera@kestrel.test'], ['Kavya Nair', 'Manager', 'kavya@kestrel.test'],
  ['Ananya Deshmukh', 'Employee', 'ananya@kestrel.test'], ['Rohan Shah', 'Finance', 'rohan@kestrel.test'],
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login(email.trim(), password); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-peacock-600"><svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M8 22V10l8 8 8-8v12" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg></span>
          <span className="font-display text-[24px] font-semibold">Muster</span>
        </div>
        <div>
          <h1 className="max-w-[520px] font-display text-[56px] font-semibold leading-[1.02]">Every day on the roll, every request on record.</h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/65">Attendance, leave, approvals and payroll for the whole company, in one place your team will actually open.</p>
        </div>
        <svg viewBox="0 0 520 60" className="w-full max-w-[520px]" aria-hidden>
          {Array.from({ length: 26 }).map((_, i) => <rect key={i} x={i * 20} y={i % 7 === 3 ? 30 : i % 5 === 1 ? 14 : 2} width="12" height={i % 7 === 3 ? 28 : i % 5 === 1 ? 44 : 56} rx="3" fill={i % 7 === 3 ? '#E59B1F' : i % 11 === 6 ? '#C8445A' : '#168A92'} opacity={i % 7 === 3 || i % 11 === 6 ? 1 : 0.55} />)}
        </svg>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <h2 className="text-[32px] font-semibold leading-none">Sign in</h2>
          <p className="mt-2 text-[14.5px] text-mute">Use the work email your HR team set up for you.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="Work email"><Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></Field>
            <Field label="Password">
              <div className="relative">
                <Input type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-mute hover:text-ink">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </Field>
            {error && <p className="rounded-ctl border border-lotus-100 bg-lotus-50 px-3 py-2 text-[13.5px] font-medium text-lotus-700" role="alert">{error}</p>}
            <Button type="submit" size="lg" loading={busy} className="w-full">Sign in</Button>
          </form>
          {import.meta.env.DEV && (
            <div className="mt-8 rounded-card border border-dashed border-line p-4">
              <p className="text-[13px] font-semibold text-ink-700">Demo accounts (password Passw0rd!)</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {DEMO.map(([n, r, m]) => (
                  <button key={m} type="button" onClick={() => { setEmail(m); setPassword('Passw0rd!'); }} className="rounded-ctl border border-line px-3 py-2 text-left hover:border-peacock-200 hover:bg-peacock-50/60">
                    <span className="block text-[13.5px] font-semibold">{n}</span><span className="text-[12.5px] text-mute">{r}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
<<<<<<< HEAD
import { Printer, Wallet } from 'lucide-react';
=======
import { Download, Printer, Wallet } from 'lucide-react';
>>>>>>> recovery-master
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Card, Empty, ErrorNote, Modal, PageHeader, Spinner } from '../../components/ui.jsx';
import { money, monthLabel } from '../../lib/format.js';
<<<<<<< HEAD
=======
import MySalaryCard from './MySalaryCard.jsx';
>>>>>>> recovery-master

export function PayslipView({ line, org }) {
  const row = (l, v, strong) => <div className={`flex justify-between py-2 text-[14.5px] ${strong ? 'border-t border-ink font-bold' : 'border-b border-line/70'}`}><span>{l}</span><span className="tabular-nums">{v}</span></div>;
  return (
    <div className="print-area">
      <div className="mb-5 flex items-start justify-between"><div><p className="font-display text-[22px] font-semibold">{org}</p><p className="text-[14px] text-mute">Payslip for {monthLabel(line.period)}</p></div><div className="text-right text-[14px]"><p className="font-semibold">{line.name}</p><p className="text-mute">{line.designation} · {line.empCode}</p></div></div>
      <div className="grid gap-8 md:grid-cols-2">
        <div><h3 className="mb-1 text-[15px] font-semibold">Earnings</h3>{row('Basic', money(line.basic))}{row('HRA', money(line.hra))}{row('Allowances', money(line.allowances))}{line.lopDays > 0 && row(`Loss of pay (${line.lopDays} days)`, `- ${money(line.lopAmount)}`)}</div>
        <div><h3 className="mb-1 text-[15px] font-semibold">Deductions</h3>{row('Provident fund', money(line.pf))}{row('Professional tax', money(line.professionalTax))}{row('Income tax (estimate)', money(line.tds))}{row('Total deductions', money(line.deductions), true)}</div>
      </div>
      <div className="mt-6 flex items-center justify-between rounded-card bg-peacock-50 px-5 py-4"><span className="text-[15px] font-semibold text-peacock-800">Net pay</span><span className="font-display text-[30px] font-semibold tabular-nums text-peacock-800">{money(line.net)}</span></div>
    </div>
  );
}

export default function PayslipsPage() {
  const { user } = useAuth(); const [open, setOpen] = useState(null);
  const q = useQuery({ queryKey: ['payslips'], queryFn: api.payroll.payslips });
  return (
    <>
<<<<<<< HEAD
      <PageHeader title="Payslips" sub="Available once Finance locks the month." />
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.length ? <Card><Empty icon={Wallet} title="No payslips yet" hint="Your payslip appears here after payroll for the month is finalized." /></Card> : (
        <Card><table className="tbl"><thead><tr><th>Month</th><th className="text-right">Gross</th><th className="text-right">Deductions</th><th className="text-right">Net pay</th></tr></thead>
          <tbody>{q.data.map((l) => <tr key={l.runId} className="row-click" onClick={() => setOpen(l)}><td className="font-semibold">{monthLabel(l.period)}</td><td className="text-right tabular-nums">{money(l.gross)}</td><td className="text-right tabular-nums">{money(l.deductions)}</td><td className="text-right font-semibold tabular-nums">{money(l.net)}</td></tr>)}</tbody></table></Card>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title="Payslip" size="lg" footer={<Button icon={Printer} variant="secondary" onClick={() => window.print()}>Print or save as PDF</Button>}>{open && <PayslipView line={open} org={user.orgName} />}</Modal>
=======
      <PageHeader title="Payslips" sub="Your payslips, and an estimate of this month so far." />
      {q.isLoading ? <Spinner /> : q.error ? <ErrorNote error={q.error} retry={q.refetch} /> : !q.data.length ? <Card><Empty icon={Wallet} title="No payslips yet" hint="Your payslip appears here after payroll for the month is paid and HR has sent the payslips." /></Card> : (
        <Card><table className="tbl"><thead><tr><th>Month</th><th className="text-right">Gross</th><th className="text-right">Deductions</th><th className="text-right">Net pay</th></tr></thead>
          <tbody>{q.data.map((l) => <tr key={l.runId} className="row-click" onClick={() => setOpen(l)}><td className="font-semibold">{monthLabel(l.period)}</td><td className="text-right tabular-nums">{money(l.gross)}</td><td className="text-right tabular-nums">{money(l.deductions)}</td><td className="text-right font-semibold tabular-nums">{money(l.net)}</td></tr>)}</tbody></table></Card>
      )}
      <MySalaryCard />
      <Modal open={!!open} onClose={() => setOpen(null)} title="Payslip" size="lg" footer={<>{open?.payslipDocumentId && <Button icon={Download} onClick={async () => { const r = await api.documents.downloadUrl(open.payslipDocumentId); window.open(r.url, '_blank', 'noopener'); }}>Download PDF</Button>}<Button icon={Printer} variant="secondary" onClick={() => window.print()}>Print</Button></>}>{open && <PayslipView line={open} org={user.orgName} />}</Modal>
>>>>>>> recovery-master
    </>
  );
}

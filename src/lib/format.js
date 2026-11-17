const TZ = 'Asia/Kolkata';
export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Intl.DateTimeFormat('en-IN', { ...opts, timeZone: 'UTC' }).format(new Date(d.length === 10 ? `${d}T00:00:00Z` : d)) : '';
export const fmtTime = (iso, tz = TZ) =>
  iso ? new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date(iso)).toLowerCase() : '–';
export const fmtDateTime = (iso, tz = TZ) =>
  iso ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date(iso)) : '';
export const money = (n) => (n == null ? '–' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n));
export const hm = (min) => (min == null ? '–' : `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, '0')}m`);
export const initials = (n = '') => n.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
export const monthLabel = (ym) => new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${ym}-01T00:00:00Z`));
export const shiftMonth = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };
export const minutesOf = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export const localMinutes = (ms, tz = TZ) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: tz }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute) + Number(p.second) / 60;
};
export const clock = (ms, tz = TZ) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: tz }).format(new Date(ms));
export const greeting = (min) => (min < 12 * 60 ? 'Good morning' : min < 17 * 60 ? 'Good afternoon' : 'Good evening');
export const hhmmLabel = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };

export const ROLE_LABEL = {
  SUPER_ADMIN: 'Super admin', HR_ADMIN: 'HR admin', HR_MANAGER: 'HR manager', MANAGER: 'Manager', PROJECT_MANAGER: 'Project manager',
  FINANCE: 'Finance', AUDITOR: 'Auditor', EMPLOYEE: 'Employee', SALES: 'Sales',
};
export const ATT_STATUS = {
  PRESENT: { label: 'On time', tone: 'moss' }, LATE: { label: 'Late', tone: 'saffron' }, HALF_DAY: { label: 'Half day', tone: 'saffron' },
  ABSENT: { label: 'Absent', tone: 'lotus' }, NOT_YET: { label: 'Not in yet', tone: 'neutral' }, NONE: { label: '–', tone: 'neutral' },
};
export const REQ_STATUS = {
  PENDING: { label: 'Pending', tone: 'saffron' }, ESCALATED: { label: 'Escalated', tone: 'lotus' }, APPROVED: { label: 'Approved', tone: 'moss' },
  REJECTED: { label: 'Rejected', tone: 'lotus' }, CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};
export const todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

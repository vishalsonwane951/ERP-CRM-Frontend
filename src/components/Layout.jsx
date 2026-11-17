import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, CalendarCheck, Plane, Receipt, Wallet, FolderOpen, Laptop, ClipboardCheck, Users, Banknote, BarChart3,
<<<<<<< HEAD
  Bell, LogOut, Menu, X, Moon, Sun,
=======
  Bell, LogOut, Menu, X, Moon, Sun, Gauge, Building2, Layers, ScrollText, LineChart, Settings, UsersRound, FolderKanban, TrendingUp, UserPlus,
>>>>>>> recovery-master
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/index.js';
import { Avatar, cx } from './ui.jsx';
import { ROLE_LABEL, fmtDateTime } from '../lib/format.js';

<<<<<<< HEAD
const MY = [
  { to: '/', label: 'Today', icon: LayoutDashboard, end: true },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/leave', label: 'Leave', icon: Plane },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/payslips', label: 'Payslips', icon: Wallet },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/assets', label: 'Equipment', icon: Laptop },
];
const COMPANY = [
  { to: '/approvals', label: 'Approvals', icon: ClipboardCheck, roles: ['MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'], badge: true },
  { to: '/people', label: 'People', icon: Users, roles: ['MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'] },
  { to: '/payroll', label: 'Payroll', icon: Banknote, roles: ['HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'] },
=======
// ONE plain list drives the sidebar. Edit it by hand to add, move or hide a page.
//   section  where it is listed (the order is SECTIONS)
//   roles    who sees it (leave out = everyone). A company SUPER_ADMIN sees everything.
//   feature  the organization must have this switch on (platform plan / feature flags)
//   platform true = only for platform staff (orgId "platform"); everything else is for company people
// A page is listed once, even if two sections would both show it.
const SECTIONS = ['My work', 'Team', 'Company', 'Finance', 'HR', 'Platform'];
const NAV = [
  { section: 'My work', to: '/', label: 'Today', icon: LayoutDashboard, end: true },
  { section: 'My work', to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { section: 'My work', to: '/leave', label: 'Leave', icon: Plane },
  { section: 'My work', to: '/expenses', label: 'Expenses', icon: Receipt },
  { section: 'My work', to: '/payslips', label: 'Payslips', icon: Wallet, feature: 'payroll' },
  { section: 'My work', to: '/documents', label: 'Documents', icon: FolderOpen },
  { section: 'My work', to: '/assets', label: 'Equipment', icon: Laptop, feature: 'assets' },

  { section: 'Team', to: '/team', label: 'My team', icon: UsersRound, roles: ['MANAGER', 'PROJECT_MANAGER'], feature: 'projects' },
  { section: 'Team', to: '/projects', label: 'Projects', icon: FolderKanban, roles: ['MANAGER', 'PROJECT_MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR'], feature: 'projects' },
  { section: 'Team', to: '/performance', label: 'Performance', icon: TrendingUp, roles: ['MANAGER', 'PROJECT_MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR'] },

  { section: 'Company', to: '/approvals', label: 'Approvals', icon: ClipboardCheck, roles: ['MANAGER', 'PROJECT_MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'], badge: true },
  { section: 'Company', to: '/people', label: 'People', icon: Users, roles: ['MANAGER', 'PROJECT_MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'] },
  { section: 'Company', to: '/reports', label: 'Reports', icon: BarChart3, roles: ['HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'], feature: 'reports' },

  { section: 'Finance', to: '/payroll', label: 'Payroll', icon: Banknote, roles: ['FINANCE', 'AUDITOR'], feature: 'payroll' },

  { section: 'HR', to: '/payroll', label: 'Payroll', icon: Banknote, roles: ['HR_ADMIN', 'HR_MANAGER'], feature: 'payroll' },
  { section: 'HR', to: '/onboarding', label: 'Onboarding', icon: UserPlus, roles: ['HR_ADMIN', 'HR_MANAGER'], feature: 'onboarding' },
  { section: 'HR', to: '/settings', label: 'Settings', icon: Settings, roles: ['HR_ADMIN'] },

  { section: 'Platform', platform: true, to: '/platform', label: 'Overview', icon: Gauge, roles: ['SUPER_ADMIN'], end: true },
  { section: 'Platform', platform: true, to: '/platform/orgs', label: 'Organizations', icon: Building2, roles: ['SUPER_ADMIN', 'SALES'] },
  { section: 'Platform', platform: true, to: '/platform/plans', label: 'Plans', icon: Layers, roles: ['SUPER_ADMIN', 'SALES', 'FINANCE'] },
  { section: 'Platform', platform: true, to: '/platform/reports', label: 'Revenue', icon: LineChart, roles: ['SUPER_ADMIN', 'FINANCE'] },
  { section: 'Platform', platform: true, to: '/platform/audit', label: 'Audit logs', icon: ScrollText, roles: ['SUPER_ADMIN'] },
>>>>>>> recovery-master
];

function useTheme() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('muster.theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  useEffect(() => {
    const el = document.documentElement;
    el.classList.add('nx'); el.dataset.theme = theme;
    return () => { el.classList.remove('nx'); delete el.dataset.theme; }; // login keeps the original look
  }, [theme]);
  const toggle = () => setTheme((t) => { const n = t === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('muster.theme', n); } catch { /* private mode */ } return n; });
  return [theme, toggle];
}

function NavItem({ item, count, onNavigate }) {
  return (
    <NavLink to={item.to} end={item.end} onClick={onNavigate}
      className={({ isActive }) => cx('group flex items-center gap-3 rounded-ctl px-3 py-2 text-[14px] font-medium transition-colors',
        isActive ? 'nx-active' : 'text-mute hover:bg-paper hover:text-ink')}>
      <item.icon className="h-[18px] w-[18px]" aria-hidden />
      <span className="flex-1">{item.label}</span>
      {item.badge && count > 0 && <span className="rounded-full bg-saffron-500 px-2 py-0.5 text-[11.5px] font-bold text-white">{count}</span>}
    </NavLink>
  );
}

function Notifications() {
  const qc = useQueryClient(); const nav = useNavigate();
  const [open, setOpen] = useState(false); const box = useRef(null);
  const q = useQuery({ queryKey: ['notifs'], queryFn: api.notifications.list, refetchInterval: 30_000 });
  const unread = (q.data || []).filter((n) => !n.read).length;
  useEffect(() => {
    const h = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = async () => {
    setOpen((o) => !o);
    if (!open && unread) { await api.notifications.readAll(); setTimeout(() => qc.invalidateQueries({ queryKey: ['notifs'] }), 1500); }
  };
  return (
    <div className="relative" ref={box}>
      <button onClick={toggle} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="relative rounded-ctl p-2 text-ink-600 hover:bg-ink/5">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-paper bg-lotus-500" />}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-[360px] overflow-hidden nx-card rounded-card border border-line bg-white shadow-pop rise">
          <p className="border-b border-line px-4 py-3 font-display text-[16px] font-semibold">Notifications</p>
          <div className="max-h-[360px] overflow-y-auto">
            {!q.data?.length && <p className="px-4 py-8 text-center text-[14px] text-mute">You are all caught up.</p>}
            {q.data?.map((n) => (
              <button key={n.id} onClick={() => { setOpen(false); n.link && nav(n.link); }} className="block w-full border-b border-line/70 px-4 py-3 text-left last:border-0 hover:bg-paper">
                <p className="text-[14px] font-semibold leading-snug">{n.title}</p>
                {n.body && <p className="mt-0.5 text-[13px] text-mute">{n.body}</p>}
                <p className="mt-1 text-[12px] text-mute/80">{fmtDateTime(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
<<<<<<< HEAD
  const { user, logout, is } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const pending = useQuery({ queryKey: ['approvals-pending'], queryFn: api.approvals.pending, refetchInterval: 60_000 });
  const company = COMPANY.filter((i) => is(...i.roles));
=======
  const { user, logout, is, has, isPlatform } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const pending = useQuery({ queryKey: ['approvals-pending'], queryFn: api.approvals.pending, refetchInterval: 60_000, enabled: !isPlatform });
  // role AND organization feature AND the right side (platform staff or company people)
  const visible = (i) => !!i.platform === isPlatform && (!i.roles || is(...i.roles)) && (!i.feature || has(i.feature));
  const seen = new Set();
  const sections = SECTIONS
    .map((name) => ({ name, items: NAV.filter((i) => i.section === name && visible(i) && !seen.has(i.to) && seen.add(i.to)) }))
    .filter((s) => s.items.length);
>>>>>>> recovery-master

  const nav = (
    <>
      <div className="mb-6 flex items-center gap-2.5 px-2 pt-1">
        <span className="nx-logo flex h-8 w-8 items-center justify-center rounded-[10px]">
          <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden><path d="M8 22V10l8 8 8-8v12" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" /></svg>
        </span>
        <div><p className="text-[17px] font-extrabold leading-none text-ink">Muster</p><p className="mt-1 text-[12px] text-mute">{user.orgName}</p></div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto" aria-label="Main">
<<<<<<< HEAD
        <div className="space-y-0.5"><p className="px-3 pb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-mute/80">My work</p>{MY.map((i) => <NavItem key={i.to} item={i} onNavigate={() => setDrawer(false)} />)}</div>
        {company.length > 0 && <div className="space-y-0.5"><p className="px-3 pb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-mute/80">Company</p>{company.map((i) => <NavItem key={i.to} item={i} count={pending.data?.length} onNavigate={() => setDrawer(false)} />)}</div>}
=======
        {sections.map((s) => (
          <div key={s.name} className="space-y-0.5">
            <p className="px-3 pb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-mute/80">{s.name}</p>
            {s.items.map((i) => <NavItem key={i.to} item={i} count={pending.data?.length} onNavigate={() => setDrawer(false)} />)}
          </div>
        ))}
>>>>>>> recovery-master
      </nav>
      <div className="mt-4 flex items-center gap-3 rounded-ctl border border-line bg-paper p-3">
        <Avatar name={user.name} size={36} />
        <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-ink">{user.name}</p><p className="truncate text-[12.5px] text-mute">{ROLE_LABEL[user.role]}</p></div>
        <button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-mute hover:bg-ink/5 hover:text-ink"><LogOut className="h-[18px] w-[18px]" /></button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white p-3 lg:flex">{nav}</aside>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="relative flex h-full w-72 flex-col bg-white p-3"><button onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute right-3 top-3 text-mute"><X className="h-5 w-5" /></button>{nav}</aside>
        </div>
      )}
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between bg-paper/90 px-5 py-2.5 backdrop-blur lg:justify-end">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="rounded-ctl p-2 text-ink-600 hover:bg-ink/5 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} className="rounded-ctl p-2 text-ink-600 hover:bg-ink/5">{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
            <Notifications />
          </div>
        </div>
        <main className="mx-auto max-w-[1240px] px-5 pb-8 pt-3 lg:px-7"><Outlet /></main>
      </div>
    </div>
  );
}

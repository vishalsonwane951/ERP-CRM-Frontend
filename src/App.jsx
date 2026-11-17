<<<<<<< HEAD
import { Navigate, Route, Routes } from 'react-router-dom';
=======
import { Navigate, Route, Routes, useMatch } from 'react-router-dom';
>>>>>>> recovery-master
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import { Spinner } from './components/ui.jsx';
import LoginPage from './modules/auth/LoginPage.jsx';
import DashboardPage from './modules/dashboard/DashboardPage.jsx';
import AttendancePage from './modules/attendance/AttendancePage.jsx';
import LeavePage from './modules/leave/LeavePage.jsx';
import ExpensesPage from './modules/expenses/ExpensesPage.jsx';
import PayslipsPage from './modules/payroll/PayslipsPage.jsx';
import PayrollPage from './modules/payroll/PayrollPage.jsx';
import DocumentsPage from './modules/documents/DocumentsPage.jsx';
import AssetsPage from './modules/assets/AssetsPage.jsx';
import ApprovalsPage from './modules/approvals/ApprovalsPage.jsx';
import EmployeesPage from './modules/employees/EmployeesPage.jsx';
import EmployeeDetailPage from './modules/employees/EmployeeDetailPage.jsx';
import ReportsPage from './modules/reports/ReportsPage.jsx';
<<<<<<< HEAD

function Guard({ roles, children }) {
  const { is } = useAuth();
  return !roles || is(...roles) ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user, booting } = useAuth();
  if (booting) return <Spinner label="Signing you in" />;
  if (!user) return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  const HRF = ['HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'];
=======
import SettingsPage from './modules/settings/SettingsPage.jsx';
import TeamDashboard from './modules/team/TeamDashboard.jsx';
import ProjectsPage from './modules/projects/ProjectsPage.jsx';
import ProjectDetailPage from './modules/projects/ProjectDetailPage.jsx';
import OnboardingPage from './modules/onboarding/OnboardingPage.jsx';
import OnboardPage from './modules/onboarding/OnboardPage.jsx';
import PerformancePage from './modules/performance/PerformancePage.jsx';
import PlatformDashboard from './modules/platform/PlatformDashboard.jsx';
import Organizations from './modules/platform/Organizations.jsx';
import Plans from './modules/platform/Plans.jsx';
import PlatformReports from './modules/platform/PlatformReports.jsx';
import AuditLogs from './modules/platform/AuditLogs.jsx';

// roles = who may open it, feature = the organization must have it switched on (the API checks both too)
function Guard({ roles, feature, children }) {
  const { is, has } = useAuth();
  return (!roles || is(...roles)) && (!feature || has(feature)) ? children : <Navigate to="/" replace />;
}

// Platform staff land on the first screen their role may use
const PLATFORM_HOME = { SUPER_ADMIN: '/platform', SALES: '/platform/orgs', FINANCE: '/platform/reports' };

export default function App() {
  const { user, booting, isPlatform } = useAuth();
  const onboard = useMatch('/onboard/:token'); // a candidate's link: no account, no sign-in
  if (onboard) return <OnboardPage token={onboard.params.token} />;
  if (booting) return <Spinner label="Signing you in" />;
  if (!user) return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  if (isPlatform) {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to={PLATFORM_HOME[user.role] || '/platform/orgs'} replace />} />
          <Route path="platform" element={<Guard roles={['SUPER_ADMIN']}><PlatformDashboard /></Guard>} />
          <Route path="platform/orgs" element={<Guard roles={['SUPER_ADMIN', 'SALES']}><Organizations /></Guard>} />
          <Route path="platform/plans" element={<Guard roles={['SUPER_ADMIN', 'SALES', 'FINANCE']}><Plans /></Guard>} />
          <Route path="platform/reports" element={<Guard roles={['SUPER_ADMIN', 'FINANCE']}><PlatformReports /></Guard>} />
          <Route path="platform/audit" element={<Guard roles={['SUPER_ADMIN']}><AuditLogs /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }
  const HRF = ['HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'];
  const LEADS = ['MANAGER', 'PROJECT_MANAGER']; // people who have a team
>>>>>>> recovery-master
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="expenses" element={<ExpensesPage />} />
<<<<<<< HEAD
        <Route path="payslips" element={<PayslipsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="approvals" element={<Guard roles={['MANAGER', ...HRF]}><ApprovalsPage /></Guard>} />
        <Route path="people" element={<Guard roles={['MANAGER', ...HRF]}><EmployeesPage /></Guard>} />
        <Route path="people/:id" element={<Guard roles={['MANAGER', ...HRF]}><EmployeeDetailPage /></Guard>} />
        <Route path="payroll" element={<Guard roles={HRF}><PayrollPage /></Guard>} />
        <Route path="reports" element={<Guard roles={HRF}><ReportsPage /></Guard>} />
=======
        <Route path="payslips" element={<Guard feature="payroll"><PayslipsPage /></Guard>} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="assets" element={<Guard feature="assets"><AssetsPage /></Guard>} />
        <Route path="approvals" element={<Guard roles={[...LEADS, ...HRF]}><ApprovalsPage /></Guard>} />
        <Route path="people" element={<Guard roles={[...LEADS, ...HRF]}><EmployeesPage /></Guard>} />
        <Route path="people/:id" element={<Guard roles={[...LEADS, ...HRF]}><EmployeeDetailPage /></Guard>} />
        <Route path="payroll" element={<Guard roles={HRF} feature="payroll"><PayrollPage /></Guard>} />
        <Route path="team" element={<Guard roles={LEADS} feature="projects"><TeamDashboard /></Guard>} />
        <Route path="projects" element={<Guard feature="projects"><ProjectsPage /></Guard>} />
        <Route path="projects/:id" element={<Guard feature="projects"><ProjectDetailPage /></Guard>} />
        <Route path="onboarding" element={<Guard roles={['HR_ADMIN', 'HR_MANAGER']} feature="onboarding"><OnboardingPage /></Guard>} />
        <Route path="performance" element={<Guard roles={[...LEADS, 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR']}><PerformancePage /></Guard>} />
        <Route path="settings" element={<Guard roles={['HR_ADMIN']}><SettingsPage /></Guard>} />
        <Route path="reports" element={<Guard roles={HRF} feature="reports"><ReportsPage /></Guard>} />
>>>>>>> recovery-master
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

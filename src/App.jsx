import { Navigate, Route, Routes } from 'react-router-dom';
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

function Guard({ roles, children }) {
  const { is } = useAuth();
  return !roles || is(...roles) ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user, booting } = useAuth();
  if (booting) return <Spinner label="Signing you in" />;
  if (!user) return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  const HRF = ['HR_ADMIN', 'HR_MANAGER', 'FINANCE', 'AUDITOR'];
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="payslips" element={<PayslipsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="approvals" element={<Guard roles={['MANAGER', ...HRF]}><ApprovalsPage /></Guard>} />
        <Route path="people" element={<Guard roles={['MANAGER', ...HRF]}><EmployeesPage /></Guard>} />
        <Route path="people/:id" element={<Guard roles={['MANAGER', ...HRF]}><EmployeeDetailPage /></Guard>} />
        <Route path="payroll" element={<Guard roles={HRF}><PayrollPage /></Guard>} />
        <Route path="reports" element={<Guard roles={HRF}><ReportsPage /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

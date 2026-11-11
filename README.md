# Muster ERP: Frontend

React 18 + Tailwind CSS + Vite. React Router, TanStack Query, Recharts.

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api/v1
npm install
npm run dev              # http://localhost:5173
npm run build
```

```
src/
  api/        axios client (token refresh) + one function per backend route
  context/    AuthContext (session, role helpers)
  components/ ui.jsx (design kit), Layout.jsx (sidebar, notifications)
  modules/    auth, dashboard, attendance, leave, approvals, employees, payroll, assets, expenses, documents, reports
```

Navigation and screens adapt to role (employee, manager, HR, finance, auditor). The API enforces every permission; the UI only hides what a role cannot use.

Design tokens live in `tailwind.config.js` (peacock primary, saffron attention, lotus danger, moss success; Bricolage Grotesque + Figtree).

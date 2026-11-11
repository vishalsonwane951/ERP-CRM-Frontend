import { http } from './client.js';

/** One function per Express route (v3 §5). Components never build URLs. */
export const api = {
  auth: { login: (b) => http.post('/auth/login', b), me: () => http.get('/auth/me') },
  org: {
    get: () => http.get('/organizations/me'),
    departments: () => http.get('/organizations/departments'),
    leaveTypes: () => http.get('/organizations/leave-types'),
    updatePolicy: (b) => http.put('/organizations/policy', b),
  },
  employees: {
    list: (params) => http.get('/employees', { params }),
    get: (id) => http.get(`/employees/${id}`),
    create: (b) => http.post('/employees', b),
    update: (id, b) => http.patch(`/employees/${id}`, b),
  },
  attendance: {
    today: () => http.get('/attendance/today'),
    checkIn: (b) => http.post('/attendance/check-in', b),
    checkOut: (b) => http.post('/attendance/check-out', b),
    mine: (month) => http.get('/attendance/me', { params: { month } }),
    forEmployee: (id, month) => http.get(`/attendance/employee/${id}`, { params: { month } }),
    org: (date) => http.get('/attendance/org', { params: { date } }),
  },
  leaves: {
    me: () => http.get('/leaves/me'),
    apply: (b) => http.post('/leaves/requests', b),
    cancel: (id) => http.post(`/leaves/requests/${id}/cancel`),
  },
  approvals: {
    pending: () => http.get('/approvals/pending'),
    byStatus: (status) => http.get('/approvals', { params: { status } }),
    detail: (id) => http.get(`/approvals/${id}`),
    act: (id, b) => http.post(`/approvals/${id}/act`, b),
  },
  expenses: { list: () => http.get('/expenses'), submit: (b) => http.post('/expenses', b) },
  payroll: {
    runs: () => http.get('/payroll/runs'),
    create: (period) => http.post('/payroll/runs', { period }),
    process: (period) => http.post(`/payroll/runs/${period}/process`),
    finalize: (period) => http.post(`/payroll/runs/${period}/finalize`),
    lines: (period) => http.get(`/payroll/runs/${period}/lines`),
    payslips: () => http.get('/payroll/payslips/me'),
  },
  assets: {
    list: () => http.get('/assets'),
    mine: () => http.get('/assets/mine'),
    create: (b) => http.post('/assets', b),
    assign: (id, b) => http.post(`/assets/${id}/assign`, b),
    giveBack: (id, b = {}) => http.post(`/assets/${id}/return`, b),
    history: (id) => http.get(`/assets/${id}/history`),
  },
  documents: {
    list: (employeeId) => http.get('/documents', { params: { employeeId } }),
    uploadUrl: (b) => http.post('/documents/upload-url', b),
    confirm: (b) => http.post('/documents/confirm', b),
    downloadUrl: (id, employeeId) => http.get(`/documents/${id}/download-url`, { params: { employeeId } }),
  },
  reports: {
    dashboard: () => http.get('/reports/dashboard'),
    trend: (days) => http.get('/reports/attendance-trend', { params: { days } }),
    audit: () => http.get('/reports/audit'),
  },
  notifications: { list: () => http.get('/notifications'), readAll: () => http.post('/notifications/read-all') },
};

import { http } from './client.js';

/** One function per Express route (v3 §5). Components never build URLs. */
export const api = {
  auth: { login: (b) => http.post('/auth/login', b), me: () => http.get('/auth/me') },
  org: {
    get: () => http.get('/organizations/me'),
    departments: () => http.get('/organizations/departments'),
    leaveTypes: () => http.get('/organizations/leave-types'),
    updatePolicy: (b) => http.put('/organizations/policy', b),
<<<<<<< HEAD
=======
    addLeaveType: (b) => http.post('/organizations/leave-types', b),
>>>>>>> recovery-master
  },
  employees: {
    list: (params) => http.get('/employees', { params }),
    get: (id) => http.get(`/employees/${id}`),
    create: (b) => http.post('/employees', b),
    update: (id, b) => http.patch(`/employees/${id}`, b),
<<<<<<< HEAD
=======
    performance: (id, month) => http.get(`/employees/${id}/performance`, { params: { month } }),
    teamPerformance: (month) => http.get('/employees/performance', { params: { month } }),
  },
  team: {
    overview: () => http.get('/team/overview'),
    employee: (id, month) => http.get(`/team/employee/${id}`, { params: { month } }),
  },
  onboarding: {
    list: () => http.get('/onboarding/invites'),
    create: (b) => http.post('/onboarding/invites', b),
    get: (token) => http.get(`/onboarding/invites/${token}`),
    resend: (token) => http.post(`/onboarding/invites/${token}/resend`),
    documentUrl: (token, documentId) => http.get(`/onboarding/invites/${token}/documents/${documentId}/url`),
    convert: (token, b) => http.post(`/onboarding/invites/${token}/convert`, b),
>>>>>>> recovery-master
  },
  attendance: {
    today: () => http.get('/attendance/today'),
    checkIn: (b) => http.post('/attendance/check-in', b),
    checkOut: (b) => http.post('/attendance/check-out', b),
<<<<<<< HEAD
=======
    startBreak: () => http.post('/attendance/break/start'),
    endBreak: () => http.post('/attendance/break/end'),
>>>>>>> recovery-master
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
<<<<<<< HEAD
    process: (period) => http.post(`/payroll/runs/${period}/process`),
    finalize: (period) => http.post(`/payroll/runs/${period}/finalize`),
    lines: (period) => http.get(`/payroll/runs/${period}/lines`),
=======
    calculate: (period) => http.post(`/payroll/runs/${period}/calculate`),
    submit: (period) => http.post(`/payroll/runs/${period}/submit`),
    approve: (period) => http.post(`/payroll/runs/${period}/approve`),
    returnRun: (period, reason) => http.post(`/payroll/runs/${period}/return`, { reason }),
    pay: (period, body) => http.post(`/payroll/runs/${period}/payments`, body), // { empIds | all, payStatus, transactionRef, paidOn, note }
    sendPayslips: (period, empId) => http.post(`/payroll/runs/${period}/payslips`, empId ? { empId } : {}),
    employeePayslips: (id) => http.get(`/payroll/payslips/employee/${id}`),
    lines: (period) => http.get(`/payroll/runs/${period}/lines`),
    myEstimate: () => http.get('/payroll/my-estimate'),
>>>>>>> recovery-master
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
<<<<<<< HEAD
=======
  projects: {
    myTasks: () => http.get('/projects/tasks/mine'),
    setTaskStatus: (projectId, taskId, status) => http.patch(`/projects/tasks/${projectId}/${taskId}/status`, { status }),
    list: () => http.get('/projects'),
    get: (id) => http.get(`/projects/${id}`),
    create: (b) => http.post('/projects', b),
    update: (id, b) => http.patch(`/projects/${id}`, b),
    setPm: (id, pmId) => http.put(`/projects/${id}/pm`, { pmId }),
    addMember: (id, empId) => http.post(`/projects/${id}/members`, { empId }),
    removeMember: (id, empId) => http.delete(`/projects/${id}/members/${empId}`),
    addTask: (id, b) => http.post(`/projects/${id}/tasks`, b),
    editTask: (id, taskId, b) => http.patch(`/projects/${id}/tasks/${taskId}`, b),
    deleteTask: (id, taskId) => http.delete(`/projects/${id}/tasks/${taskId}`),
  },
  platform: {
    dashboard: () => http.get('/platform/dashboard'),
    reports: () => http.get('/platform/reports'),
    audit: (orgId) => http.get('/platform/audit', { params: { orgId } }),
    orgs: () => http.get('/platform/organizations'),
    createOrg: (b) => http.post('/platform/organizations', b),
    updateOrg: (id, b) => http.patch(`/platform/organizations/${id}`, b),
    suspendOrg: (id) => http.post(`/platform/organizations/${id}/suspend`),
    reactivateOrg: (id) => http.post(`/platform/organizations/${id}/reactivate`),
    setFeatures: (id, features) => http.put(`/platform/organizations/${id}/features`, { features }),
    setPlan: (id, planId) => http.put(`/platform/organizations/${id}/plan`, { planId }),
    plans: () => http.get('/platform/plans'),
    createPlan: (b) => http.post('/platform/plans', b),
    updatePlan: (id, b) => http.patch(`/platform/plans/${id}`, b),
  },
>>>>>>> recovery-master
  notifications: { list: () => http.get('/notifications'), readAll: () => http.post('/notifications/read-all') },
};

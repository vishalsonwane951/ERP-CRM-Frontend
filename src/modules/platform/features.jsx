// The switches an organization can have. Keep in step with FEATURES in backend/services/helpers.js.
export const FEATURES = [
  { key: 'payroll', label: 'Payroll and payslips' },
  { key: 'assets', label: 'Equipment / assets' },
  { key: 'reports', label: 'Reports and audit trail' },
  { key: 'onboarding', label: 'Employee onboarding' },
  { key: 'projects', label: 'Projects and tasks' },
];

/** Check boxes for a { payroll: true, ... } object. `value` is the object, onChange gets the new object. */
export function FeatureToggles({ value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      {FEATURES.map((f) => (
        <label key={f.key} className="flex items-center gap-2.5 text-[14px]">
          <input type="checkbox" disabled={disabled} checked={!!value[f.key]} onChange={(e) => onChange({ ...value, [f.key]: e.target.checked })} />
          {f.label}
        </label>
      ))}
    </div>
  );
}

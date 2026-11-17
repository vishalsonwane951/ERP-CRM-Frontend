import { cx } from '../../components/ui.jsx';
import { fmtTime, hm, todayISO } from '../../lib/format.js';

const DOT = { PRESENT: 'bg-moss-500', LATE: 'bg-saffron-500', HALF_DAY: 'bg-saffron-500', ABSENT: 'bg-lotus-500' };
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthCalendar({ month, data, tz }) {
  const [y, m] = month.split('-').map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const byDate = Object.fromEntries((data?.records || []).map((r) => [r.date, r]));
  const today = todayISO();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const s = data?.summary || {};

  return (
    <div>
      <div className="grid grid-cols-2 border-b border-line md:grid-cols-4 [&>div]:border-line md:[&>div]:border-r md:[&>div:last-child]:border-r-0">
        {[['On time', s.present ?? 0], ['Late', s.late ?? 0], ['Half days', s.halfDay ?? 0], ['Hours worked', hm(s.workedMinutes ?? 0)]].map(([l, v]) => (
          <div key={l} className="px-5 py-3.5"><p className="text-[13px] text-mute">{l}</p><p className="font-display text-[26px] font-semibold leading-tight tabular-nums">{v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-b border-line bg-paper/60 text-center text-[12.5px] font-semibold text-mute">
        {WEEK.map((w) => <div key={w} className="py-2">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={`b${i}`} className="min-h-[78px] border-b border-r border-line/60 bg-paper/40" />;
          const iso = `${month}-${String(d).padStart(2, '0')}`;
          const r = byDate[iso]; const weekend = i % 7 >= 5; const future = iso > today;
          return (
            <div key={iso} className={cx('min-h-[78px] border-b border-r border-line/60 p-2', (weekend || future) && 'bg-paper/40', iso === today && 'bg-peacock-50')}>
              <div className="flex items-center justify-between">
                <span className={cx('text-[13px] font-semibold', weekend || future ? 'text-mute/60' : 'text-ink-700', iso === today && 'text-peacock-700')}>{d}</span>
                {r && <span className={cx('h-2.5 w-2.5 rounded-full', DOT[r.status])} aria-hidden />}
              </div>
              {r && (
                <div className="mt-1.5 text-[12px] leading-tight text-mute">
                  <p className="font-medium text-ink-700">{fmtTime(r.checkInAt, tz)}</p>
                  <p className="hidden sm:block">{r.status === 'LATE' ? `${r.lateByMinutes}m late` : r.status === 'HALF_DAY' ? 'Half day' : r.workedMinutes ? hm(r.workedMinutes) : r.checkOutAt ? '' : 'In'}</p>
                </div>
              )}
              {!r && !weekend && !future && iso < today && <p className="mt-1.5 text-[12px] text-lotus-600">Absent</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

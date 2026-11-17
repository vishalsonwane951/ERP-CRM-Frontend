import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
<<<<<<< HEAD
import { LogIn, LogOut, MapPin } from 'lucide-react';
=======
import { Coffee, LogIn, LogOut, MapPin } from 'lucide-react';
>>>>>>> recovery-master
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, useToast, cx } from '../../components/ui.jsx';
import { ATT_STATUS, clock, fmtDate, fmtTime, hhmmLabel, hm, localMinutes, minutesOf } from '../../lib/format.js';

const deviceId = () => {
  let d = localStorage.getItem('muster.device');
  if (!d) { d = crypto.randomUUID(); localStorage.setItem('muster.device', d); }
  return d;
};
const position = () => new Promise((res) => {
  if (!navigator.geolocation) return res({});
  navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res({}), { timeout: 3500, maximumAge: 60000 });
});

/** The shift laid out as a ribbon: when you are on time, late, or a half day, and where "now" sits in it */
function DayRibbon({ shift, policy, nowMin, inMin }) {
  const s = minutesOf(shift.start); const e = minutesOf(shift.end);
  const a = s - 90; const b = e + 60; const span = b - a;
  const pct = (m) => `${Math.min(Math.max(((m - a) / span) * 100, 0), 100)}%`;
  const seg = (from, to, cls) => <div key={cls} className={cx('absolute inset-y-0', cls)} style={{ left: pct(from), width: `${((Math.min(to, b) - Math.max(from, a)) / span) * 100}%` }} />;
  const onTimeEnd = s + policy.graceMinutes; const lateEnd = s + policy.halfDayAfterMinutes;
  const hh = (m) => hhmmLabel(`${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`);
  return (
    <div>
      <div className="relative h-4 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`Shift ${hhmmLabel(shift.start)} to ${hhmmLabel(shift.end)}. On time until ${hh(onTimeEnd)}, late until ${hh(lateEnd)}.`}>
        {seg(s, onTimeEnd, 'bg-moss-500')}{seg(onTimeEnd, lateEnd, 'bg-saffron-500')}{seg(lateEnd, e, 'bg-lotus-500/70')}
      </div>
      <div className="relative -mt-[22px] h-7">
        {nowMin >= a && nowMin <= b && <span className="absolute top-0 h-7 w-[3px] -translate-x-1/2 rounded bg-white" style={{ left: pct(nowMin) }} title="Now" />}
        {inMin != null && <span className="absolute top-1 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-white bg-peacock-200" style={{ left: pct(inMin) }} title="You checked in" />}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-white/60">
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-moss-500" />On time until {hh(onTimeEnd)}</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-saffron-500" />Late until {hh(lateEnd)}</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lotus-500" />Half day after</span>
      </div>
    </div>
  );
}

export default function PunchCard() {
  const { user } = useAuth(); const toast = useToast(); const qc = useQueryClient();
  const tz = user.timezone || 'Asia/Kolkata';
  const q = useQuery({ queryKey: ['att-today'], queryFn: api.attendance.today, refetchInterval: 120_000 });
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const offset = useMemo(() => (q.data ? new Date(q.data.serverTime).getTime() - Date.now() : 0), [q.dataUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const idem = useRef(crypto.randomUUID()); // reused across retries of the same tap, so a flaky network can never double check-in

  const refresh = () => ['att-today', 'dashboard', 'att-trend', 'att-org', 'att-mine'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const checkIn = useMutation({
    mutationFn: async () => api.attendance.checkIn({ idempotencyKey: idem.current, deviceId: deviceId(), ...(await position()) }),
    onSuccess: (r) => { idem.current = crypto.randomUUID(); refresh(); toast.success(r.status === 'PRESENT' ? 'Checked in. Have a good day.' : `Checked in, ${r.lateByMinutes} minutes after shift start.`); },
    onError: (e) => toast.error(e.message),
  });
  const checkOut = useMutation({
    mutationFn: async () => api.attendance.checkOut({ deviceId: deviceId(), ...(await position()) }),
    onSuccess: (r) => { refresh(); toast.success(`Checked out. You worked ${hm(r.workedMinutes)} today.`); },
    onError: (e) => toast.error(e.message),
  });

<<<<<<< HEAD
  if (!q.data) return <div className="h-[330px] animate-pulse nx-hero rounded-card bg-ink/90" aria-busy />;
  const { record, shift, policy, date } = q.data;
=======
  const startBreak = useMutation({
    mutationFn: api.attendance.startBreak,
    onSuccess: () => { refresh(); toast.success('Break started.'); },
    onError: (e) => { toast.error(e.message); refresh(); },
  });
  const endBreak = useMutation({
    mutationFn: api.attendance.endBreak,
    onSuccess: () => { refresh(); toast.success('Welcome back.'); },
    onError: (e) => { toast.error(e.message); refresh(); },
  });

  if (!q.data) return <div className="h-[330px] animate-pulse nx-hero rounded-card bg-ink/90" aria-busy />;
  const { record, shift, policy, date, breaksUsed, onBreak, canBreakNow, breakBlockedReason } = q.data;
>>>>>>> recovery-master
  const t = now + offset;
  const nowMin = localMinutes(t, tz);
  const inMin = record?.checkInAt ? localMinutes(new Date(record.checkInAt).getTime(), tz) : null;
  const status = record ? ATT_STATUS[record.status] : null;
<<<<<<< HEAD
  const live = record?.checkInAt && !record.checkOutAt ? Math.round((t - new Date(record.checkInAt).getTime()) / 60000) : null;
=======
  // time spent on breaks so far (an open break counts until now); it is not working time
  const breakMin = (record?.breaks || []).reduce((sum, b) => sum + ((b.endAt ? new Date(b.endAt).getTime() : t) - new Date(b.startAt).getTime()), 0) / 60000;
  const live = record?.checkInAt && !record.checkOutAt ? Math.max(0, Math.round((t - new Date(record.checkInAt).getTime()) / 60000 - breakMin)) : null;
  const breaksOn = policy.maxBreaksPerDay > 0; // the numbers come from the organization's settings
  const openBreak = onBreak ? record.breaks[record.breaks.length - 1] : null;
>>>>>>> recovery-master

  return (
    <section className="nx-hero rounded-card bg-ink p-6 text-white lg:p-7" aria-label="Today's attendance">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[14.5px] text-white/65">{fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <p className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white/80">{shift.name} shift · {hhmmLabel(shift.start)} to {hhmmLabel(shift.end)}</p>
      </div>
      <p className="mt-4 font-display text-[64px] font-bold leading-none tabular-nums tracking-tight" aria-live="off">{clock(t, tz)}</p>

      <div className="mt-7"><DayRibbon shift={shift} policy={policy} nowMin={nowMin} inMin={inMin} /></div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div>
          {!record && <p className="text-[16px] font-medium">You have not checked in yet.</p>}
          {record && !record.checkOutAt && (<>
            <p className="text-[16px] font-medium">Checked in at {fmtTime(record.checkInAt, tz)}</p>
            <p className="mt-0.5 text-[14px] text-white/65">{status?.label}{live != null && ` · working for ${hm(live)}`}</p>
<<<<<<< HEAD
=======
            {breaksOn && <p className="mt-0.5 text-[13px] text-white/65">{onBreak ? `On break since ${fmtTime(openBreak.startAt, tz)} · ` : ''}{breaksUsed} of {policy.maxBreaksPerDay} breaks used</p>}
            {breaksOn && !onBreak && !canBreakNow && breakBlockedReason && <p className="mt-0.5 text-[12.5px] text-white/50">{breakBlockedReason}</p>}
>>>>>>> recovery-master
          </>)}
          {record?.checkOutAt && (<>
            <p className="text-[16px] font-medium">Day complete · {hm(record.workedMinutes)}</p>
            <p className="mt-0.5 text-[14px] text-white/65">In {fmtTime(record.checkInAt, tz)}, out {fmtTime(record.checkOutAt, tz)} · {status?.label}</p>
          </>)}
          {policy.geofence && <p className="mt-1 flex items-center gap-1 text-[12.5px] text-white/50"><MapPin className="h-3.5 w-3.5" />Location is checked when you punch in</p>}
        </div>
        {!record && <Button size="lg" icon={LogIn} loading={checkIn.isPending} onClick={() => checkIn.mutate()} className="min-w-[170px] !bg-white !bg-none !text-[#5748cf] !shadow-none hover:!bg-white/90">Check in</Button>}
<<<<<<< HEAD
        {record && !record.checkOutAt && <Button size="lg" icon={LogOut} variant="secondary" loading={checkOut.isPending} onClick={() => checkOut.mutate()} className="min-w-[170px]">Check out</Button>}
=======
        {record && !record.checkOutAt && (
          <div className="flex flex-wrap items-center gap-3">
            {onBreak && <Button size="lg" icon={Coffee} loading={endBreak.isPending} onClick={() => endBreak.mutate()} className="min-w-[150px] !bg-white !bg-none !text-[#5748cf] !shadow-none hover:!bg-white/90">End break</Button>}
            {canBreakNow && <Button size="lg" icon={Coffee} variant="secondary" loading={startBreak.isPending} onClick={() => startBreak.mutate()} className="min-w-[150px]">Take a break</Button>}
            <Button size="lg" icon={LogOut} variant="secondary" loading={checkOut.isPending} onClick={() => checkOut.mutate()} className="min-w-[150px]">Check out</Button>
          </div>
        )}
>>>>>>> recovery-master
      </div>
    </section>
  );
}

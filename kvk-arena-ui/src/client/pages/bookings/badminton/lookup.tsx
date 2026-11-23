import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CalendarDays, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { badmintonLookupError, lookupBadmintonBookings, sendBadmintonLookupCode, type TrackedBadmintonBooking } from "@/services/badminton-lookup-api";

const inputStyle = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-amber-700 focus:outline-2 focus:outline-amber-700";
const dateFormat = new Intl.DateTimeFormat("en-LK", { dateStyle: "full", timeZone: "Asia/Colombo" });
const amountFormat = new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" });

export default function BadmintonBookingLookup() {
  const [phone, setPhone] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [bookings, setBookings] = useState<TrackedBadmintonBooking[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now);
  const requestInFlight = useRef(false);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (challengeId && bookings === null) codeInput.current?.focus();
  }, [challengeId, bookings]);

  useEffect(() => {
    if (!bookings?.length) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [bookings]);

  function reset() {
    setChallengeId("");
    setBookings(null);
    setCode("");
    setError("");
  }

  async function run(action: () => Promise<void>) {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (reason) {
      setError(badmintonLookupError(reason));
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  const sendCode = () => run(async () => {
    setChallengeId(await sendBadmintonLookupCode(phone));
    setCode("");
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId) {
      void sendCode();
      return;
    }
    void run(async () => {
      const results = await lookupBadmintonBookings(phone, challengeId, code);
      setNow(Date.now());
      setBookings(results);
    });
  }

  const upcomingSlots: TrackedBadmintonBooking[] = [];
  const pastSlots: TrackedBadmintonBooking[] = [];
  for (const booking of bookings ?? []) {
    const endDate = new Date(`${booking.bookingDate}T${booking.endTime}+05:30`);
    if (booking.endTime < booking.startTime) endDate.setUTCDate(endDate.getUTCDate() + 1);
    (endDate.getTime() <= now ? pastSlots : upcomingSlots).push(booking);
  }
  upcomingSlots.sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-slate-950 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link to="/badminton#bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Badminton
        </Link>
        <header className="my-6 rounded-3xl bg-amber-950 p-6 text-white sm:p-9">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Track badminton bookings</h1>
          <p className="mt-2 max-w-xl text-amber-100">Find court reservations using the mobile number you gave when booking.</p>
        </header>

        {bookings === null ? (
          <form onSubmit={submit} className="max-w-lg space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <label className="block text-sm font-semibold">
              Mobile number
              <input className={inputStyle} type="tel" autoComplete="tel" placeholder="077 123 4567" maxLength={32}
                value={phone} onChange={event => setPhone(event.target.value)} required disabled={busy || Boolean(challengeId)} />
            </label>
            {challengeId && (
              <label className="block text-sm font-semibold">
                SMS verification code
                <input ref={codeInput} className={inputStyle} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}"
                  value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required disabled={busy} />
                <span className="mt-2 block font-normal text-slate-600">Enter the six-digit code sent to your mobile number.</span>
              </label>
            )}
            {error && <p role="alert" className="text-sm font-medium text-red-800">{error}</p>}
            <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 font-bold text-white hover:bg-amber-900 disabled:opacity-60">
              <Search size={17} aria-hidden="true" />
              {busy ? "Please wait…" : challengeId ? "Find bookings" : "Send verification code"}
            </button>
            {challengeId && (
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-amber-900">
                <button type="button" onClick={reset} disabled={busy} className="underline">Change number</button>
                <button type="button" onClick={() => void sendCode()} disabled={busy} className="underline">Resend code</button>
              </div>
            )}
          </form>
        ) : (
          <section aria-labelledby="lookup-results">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="lookup-results" className="text-xl font-bold">Your bookings</h2>
              <button type="button" onClick={reset} className="text-sm font-semibold text-amber-900 underline">Search again</button>
            </div>
            {bookings.length === 0 ? <p className="rounded-xl border border-stone-200 bg-white p-5">No court bookings were found for this number.</p> : (
              <div className="space-y-7">
                {[
                  { title: "Upcoming slots", id: "upcoming-slots", slots: upcomingSlots, empty: "You have no upcoming slots." },
                  { title: "Past slots", id: "past-slots", slots: pastSlots, empty: "You have no past slots." },
                ].map(({ title, id, slots, empty }) => (
                  <section key={id} aria-labelledby={id}>
                    <h3 id={id} className="mb-3 text-lg font-bold">{title} <span className="ml-1 rounded-full bg-stone-200 px-2.5 py-1 text-xs">{slots.length}</span></h3>
                    {slots.length === 0 ? <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-slate-600">{empty}</p> : (
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {slots.map((booking, index) => (
                          <li key={`${booking.bookingNumber}-${index}`}
                            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${id === "upcoming-slots" ? "border-amber-200" : "border-stone-200"}`}>
                            <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5 ${id === "upcoming-slots" ? "border-amber-200 bg-amber-50" : "border-stone-200 bg-stone-100"}`}>
                              <h4 className="text-lg font-black leading-tight text-slate-950">{booking.courtName}</h4>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${booking.status === "Confirmed" || booking.status === "Completed"
                                ? "bg-emerald-100 text-emerald-900"
                                : booking.status === "Cancelled" ? "bg-rose-100 text-rose-900" : "bg-amber-200 text-amber-950"}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="px-5 py-4">
                              <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <CalendarDays size={16} className="shrink-0" aria-hidden="true" /> {dateFormat.format(new Date(booking.bookingDate))}
                              </p>
                              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <p className="text-xl font-bold tracking-tight tabular-nums text-slate-950">
                                  {booking.startTime.slice(0, 5)}–{booking.endTime.slice(0, 5)}
                                </p>
                                <p className="text-sm font-bold tabular-nums text-slate-700">{amountFormat.format(booking.bookingAmount)}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            )}
            {bookings.length === 250 && <p className="mt-3 text-sm text-slate-600">Showing the 250 most recent court slots.</p>}
          </section>
        )}
      </div>
    </main>
  );
}

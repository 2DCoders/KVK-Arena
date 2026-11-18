import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Info, LoaderCircle, ShieldCheck, Ticket, Users } from "lucide-react";
import MemberHeader from "./member-header";
import { getEnv } from "@/env";
import { bookingError, checkMemberBooking, getMemberBookingSetup, holdMemberBooking, quoteMemberCoupon, releaseMemberHold, type AvailabilityQuote, type BookingSetup, type BookingHold, type CouponQuote, type MemberSlipBooking, bookMemberSessions, type MemberBookingRequest } from "@/services/member-badminton-api";
import { consecutiveSlots, countdown, endDate, isDate, maximumWeeks, money, remainingSeconds, slotLabel, sriLankaToday, validateSchedule, WEEKDAYS } from "./booking-utils";
import BankTransferInstructions from "./bank-transfer-details";
import "./member-booking.css";

export default function MemberBadmintonBooking() {
  const env = getEnv();
  const today = sriLankaToday();
  const minDate = isDate(env.BADMINTON_BOOKING_START_DATE) && env.BADMINTON_BOOKING_START_DATE > today ? env.BADMINTON_BOOKING_START_DATE : today;
  const configuredMax = maximumWeeks(env.BOOKING_DURATION);
  const [setup, setSetup] = useState<BookingSetup | null>(null);
  const [startDate, setStartDate] = useState(minDate);
  const [weeks, setWeeks] = useState(configuredMax || 1);
  const [days, setDays] = useState<string[]>(["Monday"]);
  const [slotIds, setSlotIds] = useState<string[]>([]);
  const [availability, setAvailability] = useState<AvailabilityQuote | null>(null);
  const [hold, setHold] = useState<BookingHold | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponQuote, setCouponQuote] = useState<CouponQuote | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"schedule" | "details" | "success">("schedule");
  const [submittedRequest, setSubmittedRequest] = useState<MemberBookingRequest | null>(null);
  const [receipt, setReceipt] = useState<MemberSlipBooking | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const lock = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const max = Math.min(configuredMax, setup?.maximumWeeks ?? configuredMax);
  const slots = setup?.slots ?? [];
  const firstSlotPrice = slots[0]?.price;
  const uniformSlotPrice = slots.every(slot => slot.price === firstSlotPrice) ? firstSlotPrice : undefined;
  const selectedSlots = slots.filter(slot => slotIds.includes(slot.slotId));
  const finish = endDate(startDate, weeks);
  const seconds = hold ? remainingSeconds(deadline, now) : 0;
  const expired = !!hold && seconds === 0;
  const schedule = { startDate, weeks, slotIds, daysOfWeek: days };
  const original = hold?.originalAmount ?? availability?.originalAmount ?? selectedSlots.reduce((sum, slot) => sum + slot.price, 0) * weeks * days.length;
  const total = couponQuote?.finalAmount ?? original;
  const serverSlotLimit = setup?.maximumDiscountableSlots;
  const configuredSlotLimit = Number(env.MAXIMUM_DISCOUNTABLE_SLOTS);
  const discountSlotLimit = Number.isSafeInteger(configuredSlotLimit) && configuredSlotLimit >= 0
    ? Math.min(configuredSlotLimit, serverSlotLimit ?? configuredSlotLimit)
    : serverSlotLimit;
  const couponReady = !!couponQuote && appliedCoupon === coupon.trim().toUpperCase();

  useEffect(() => {
    const previous = document.title;
    document.title = "Member Court Reservations | KVK Arena";
    window.scrollTo(0, 0);
    return () => { document.title = previous; };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setLoadError("");
    getMemberBookingSetup(controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (!configuredMax) throw new Error("Booking durations are not available yet. Please contact KVK Arena.");
      if (!data.court || !data.slots?.length) throw new Error("No sessions are available right now. Please try again later.");
      setSetup(data);
      setWeeks(current => Math.min(current, configuredMax, data.maximumWeeks));
    }).catch(reason => { if (!controller.signal.aborted) setLoadError(bookingError(reason)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload, configuredMax]);
  useEffect(() => {
    if (!hold || stage !== "details") return;
    const updateClock = () => setNow(Date.now());
    const timer = window.setInterval(updateClock, 1000);
    document.addEventListener("visibilitychange", updateClock);
    window.addEventListener("focus", updateClock);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateClock);
      window.removeEventListener("focus", updateClock);
    };
  }, [hold, stage]);
  useEffect(() => {
    if (stage === "schedule") return;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [stage]);

  function invalidate() { setAvailability(null); setError(""); }
  function toggleSlot(id: string) {
    const next = slotIds.includes(id) ? slotIds.filter(value => value !== id) : [...slotIds, id];
    if (next.length && !consecutiveSlots(next, slots)) { setError("Choose adjacent slots. Remove the last selected slot first to avoid a gap."); return; }
    invalidate(); setSlotIds(next);
  }
  async function run(action: string, work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(action); setError("");
    try { await work(); } catch (reason) { setError(bookingError(reason)); }
    finally { lock.current = false; setBusy(""); }
  }
  function check() {
    const message = validateSchedule(startDate, minDate, weeks, max, days, slotIds, slots);
    if (message) { setError(message); return; }
    void run("check", async () => {
      setAvailability(null);
      const result = await checkMemberBooking(schedule);
      setAvailability(result);
      if (!result.isAvailable) setError("Some sessions are unavailable. Adjust your selection and check again.");
    });
  }
  function reserve() {
    if (!availability?.isAvailable) return;
    void run("hold", async () => {
      const result = await holdMemberBooking(schedule).catch(reason => {
        setAvailability(null);
        throw reason;
      });
      if (!result.holdToken || result.expiresInSeconds <= 0) throw new Error("Your sessions could not be reserved. Please check availability again.");
      const clock = Date.now();
      setHold(result); setDeadline(clock + result.expiresInSeconds * 1000); setNow(clock);
      setCouponQuote(null); setAppliedCoupon(""); setStage("details");
    });
  }
  function applyCoupon() {
    if (!hold || remainingSeconds(deadline) === 0) return;
    const code = coupon.trim().toUpperCase();
    if (!code) { setError("Enter your unredeemed coupon code."); return; }
    void run("coupon", async () => {
      setCouponQuote(null); setAppliedCoupon("");
      const quote = await quoteMemberCoupon(hold.holdToken, code, discountSlotLimit);
      setCouponQuote(quote); setAppliedCoupon(code);
    });
  }
  function submitBooking(request: MemberBookingRequest) {
    void run("book", async () => {
      const result = await bookMemberSessions(request);
      setSubmittedRequest(result.smsSent ? null : request);
      setReceipt(result);
      setStage("success");
      setHold(null);
    });
  }
  function confirm() {
    if (!hold || !couponReady) return;
    if (!name.trim() || !/^\+?[0-9]{9,15}$/.test(phone) || !email.trim()) {
      setError("Enter your name, email and a valid phone number.");
      return;
    }
    submitBooking({ holdToken: hold.holdToken, customerName: name.trim(), phoneNumber: phone, couponCode: appliedCoupon, email: email.trim(), maximumDiscountableSlots: discountSlotLimit });
  }
  function cancel() {
    void run("release", async () => {
      if (hold && !expired) await releaseMemberHold(hold.holdToken);
      setHold(null);
      setCouponQuote(null);
      setAppliedCoupon("");
      setAvailability(null);
      setStage("schedule");
    });
  }
  const spinner = <LoaderCircle size={16} className="mb-spin" />;

  return (
    <div className="member-badminton">
      <MemberHeader />

      <main className="mb-container mb-booking-area">
        <nav className="mb-steps" aria-label="Booking progress">
          {["Your schedule", "Your details", "Submitted"].map((label, index) => {
            const current = stage === "schedule" ? 0 : stage === "details" ? 1 : 2;
            return <span key={label} className={current === index ? "is-current" : current > index ? "is-complete" : ""} aria-current={current === index ? "step" : undefined}><i>{current > index ? <Check size={13} /> : index + 1}</i>{label}{index < 2 && <ChevronRight size={14} />}</span>;
          })}
        </nav>
        <details className="mb-booking-guide">
          <summary><Info size={17} aria-hidden="true" /> How to book <ChevronRight size={15} aria-hidden="true" /></summary>
          <ol>
            <li><strong>Choose your sessions.</strong> Pick a start date, duration, days, and consecutive time slots. Check the estimated total.</li>
            <li><strong>Check availability and reserve.</strong> If all sessions are available, select Reserve sessions to hold them while you complete your details.</li>
            <li><strong>Apply your coupon and book.</strong> Enter your details, apply your coupon, review the final amount, and select Book sessions before the timer ends.</li>
            <li><strong>Pay and upload your slip.</strong> If payment is due, transfer the amount and upload the slip within 24 hours using the link in your SMS or receipt. Use your reference to track approval or replace your slip while Admin reviews it.</li>
          </ol>
        </details>
        {stage === "success" && receipt ? (
          <section className="mb-panel mb-success">
            <div className="mb-success-icon"><CheckCircle2 size={38} /></div>
            <h2 ref={headingRef} tabIndex={-1}>Booking submitted.</h2>
            <p>{weeks * days.length * slotIds.length} sessions at {setup?.court.name}.</p>
            <div className="mb-receipt">
              <div><span>Booked for</span><strong>{name}</strong></div>
              <div><span>Booking period</span><strong>{startDate} to {finish}</strong></div>
              <div><span>Schedule</span><strong>{days.join(", ")} · {weeks} weeks</strong></div>
              <div><span>Time</span><strong>{selectedSlots.map(slotLabel).join(", ")}</strong></div>
              <div><span>Final amount</span><strong>{money(receipt.finalAmount)}</strong></div>
            </div>
            <div className="mb-reference"><span>Booking reference</span><strong>{receipt.reference}</strong></div>
            <p>{receipt.finalAmount > 0
              ? `Pay ${money(receipt.finalAmount)} within 24 hours and upload your payment slip for admin approval.`
              : "Your coupon covered the full amount. Your booking is awaiting admin approval."}</p>
            {receipt.finalAmount > 0 && <BankTransferInstructions details={receipt.bankTransfer} />}
            {receipt.smsSent ? <p>We sent the reference and tracking link by SMS.</p> : <p role="status">SMS delivery could not be confirmed. Save your reference or retry the SMS.</p>}
            {error && <div className="mb-alert" role="alert">{error}</div>}
            <div className="mb-availability-actions">
              <Link className="mb-primary" to={`/members/badminton/track/${receipt.reference}`}>Track booking{receipt.finalAmount > 0 ? " and upload slip" : ""}</Link>
              {submittedRequest && <button className="mb-cancel" disabled={!!busy} onClick={() => submitBooking(submittedRequest)}>Retry SMS</button>}
              <button className="mb-cancel" disabled={!!busy} onClick={() => { setStage("schedule"); setReceipt(null); setSubmittedRequest(null); setAvailability(null); setCouponQuote(null); setCoupon(""); setAppliedCoupon(""); setSlotIds([]); }}>Book another schedule</button>
            </div>
          </section>
        ) : (
          <div className="mb-layout">
            <section className="mb-panel">
              <div className="mb-panel-heading"><span className="mb-section-icon">{stage === "schedule" ? <CalendarDays size={20} /> : <Users size={20} />}</span><div><h2 ref={headingRef} tabIndex={-1}>{stage === "schedule" ? "Build your schedule" : "Complete your reservation"}</h2><p>{stage === "schedule" ? "Choose your weekly sessions. We'll check every date." : "Add your details and apply an unredeemed coupon."}</p></div></div>
              {error && <div className="mb-alert" role="alert">{error}</div>}
              {stage === "schedule" ? <>
                {loadError && <div className="mb-alert" role="alert">{loadError}<button type="button" onClick={() => setReload(value => value + 1)}>Try again</button></div>}
                {loading ? <p className="mb-loading" role="status">{spinner} Loading your court...</p> : <form onSubmit={event => { event.preventDefault(); check(); }}>
                  <fieldset className="mb-fields" disabled={!!busy || !!loadError}>
                    <div className="mb-court-display"><span className="mb-section-icon"><CalendarDays size={21} /></span><div><span>Booking court</span><strong>{setup?.court.name}</strong></div><span className="mb-court-status"><i /> Indoor court</span></div>
                    <div className="mb-input-row">
                      <div className="mb-field"><label htmlFor="mb-start">First booking date</label><input id="mb-start" type="date" required min={minDate} value={startDate} onChange={event => { invalidate(); setStartDate(event.target.value); }} /></div>
                      <div className="mb-field"><label htmlFor="mb-weeks">Duration</label><select id="mb-weeks" value={weeks} required onChange={event => { invalidate(); setWeeks(Number(event.target.value)); }}>{Array.from({ length: max }, (_, i) => i + 1).map(value => <option key={value} value={value}>{value} {value === 1 ? "week" : "weeks"}</option>)}</select><p className="mb-help">Up to {max} weeks per booking.</p></div>
                    </div>
                    <div className="mb-end-date"><CalendarDays size={16} /><span>Booking period ends</span><strong>{finish || "Choose a start date"}</strong></div>
                    <div className="mb-field"><label>Days you want to play</label><div className="mb-days" role="group" aria-label="Days of the week">{WEEKDAYS.map(day => <button key={day} type="button" aria-label={day} aria-pressed={days.includes(day)} className={days.includes(day) ? "is-selected" : ""} onClick={() => { invalidate(); setDays(current => WEEKDAYS.filter(value => value === day ? !current.includes(day) : current.includes(value))); }}>{day.slice(0, 3)}</button>)}</div></div>
                    <div className="mb-field">
                      <label>Choose your time</label>
                      <p className="mb-help">Select consecutive slots.{uniformSlotPrice === undefined && slots.length > 0 && " Prices shown are per session."}</p>
                      {uniformSlotPrice !== undefined && <div className="mb-session-rate">
                        <span><Ticket size={18} /> Price per session</span>
                        <strong>{money(uniformSlotPrice)}</strong>
                      </div>}
                      <div className="mb-slots" role="group" aria-label="Time slots">
                        {slots.map(slot => <button key={slot.slotId} type="button" aria-pressed={slotIds.includes(slot.slotId)}
                          className={slotIds.includes(slot.slotId) ? "is-selected" : ""} onClick={() => toggleSlot(slot.slotId)}>
                          <Clock3 size={14} />
                          <span>{slotLabel(slot)}{uniformSlotPrice === undefined && <small className="mb-slot-price">{money(slot.price)}</small>}</span>
                          <Check className="mb-slot-check" size={14} aria-hidden="true" />
                        </button>)}
                      </div>
                    </div>
                  </fieldset>
                  {!!availability?.unavailableSchedules.length && <div className="mb-conflicts" role="status"><strong>Unavailable sessions</strong>{availability.unavailableSchedules.map((item, index) => <p key={`${item.date}-${item.slotId}-${index}`}>{item.date} · {item.slotName}<br />{item.message}</p>)}</div>}
                  {availability?.isAvailable ? <div className="mb-availability-ready"><div className="mb-available"><CheckCircle2 size={18} /><span>All {availability.bookingCount} sessions are available.</span></div><p className="mb-help">Reserve these sessions before entering your details.</p><div className="mb-availability-actions"><button className="mb-cancel" type="button" disabled={!!busy} onClick={invalidate}>Cancel</button><button className="mb-primary" type="button" disabled={!!busy} onClick={reserve}>{busy === "hold" ? <>{spinner} Checking & reserving...</> : <>Reserve sessions <ArrowRight size={16} /></>}</button></div></div> : <div className="mb-form-action"><span><ShieldCheck size={15} /> Every selected date is checked</span><button className="mb-primary" type="submit" disabled={!!busy || !slots.length || !!loadError}>{busy === "check" ? <>{spinner} Checking...</> : <>Check availability <ArrowRight size={16} /></>}</button></div>}
                </form>}
              </> : <>
                <div className={`mb-hold-timer ${expired || seconds <= 60 ? "is-urgent" : ""}`} role="timer" aria-label={expired ? "Reservation expired" : `${seconds} seconds remaining`}><Clock3 size={19} /><div><strong>{expired ? "Your hold has expired" : "Your sessions are reserved"}</strong><span>{expired ? "Check availability again to reserve your sessions." : "Complete your details before the timer ends."}</span></div><b>{countdown(seconds)}</b></div>
                <form onSubmit={event => { event.preventDefault(); confirm(); }}>
                  <fieldset className="mb-fields" disabled={!!busy || expired}>
                    <div className="mb-input-row"><div className="mb-field"><label htmlFor="mb-name"><span>Full name</span></label><input id="mb-name" autoComplete="name" required maxLength={100} value={name} placeholder="Your full name" onChange={event => setName(event.target.value)} /></div><div className="mb-field"><label htmlFor="mb-phone"><span>Phone number</span></label><input id="mb-phone" type="tel" autoComplete="tel" required pattern="\+?[0-9]{9,15}" placeholder="0771234567" value={phone} onChange={event => setPhone(event.target.value.replace(/[^0-9+]/g, ""))} /></div></div>
                    <div className="mb-field"><label htmlFor="mb-coupon"><Ticket size={15} /><span>Coupon code <small>(required)</small></span></label><div className="mb-coupon-input"><input id="mb-coupon" autoComplete="off" required maxLength={100} placeholder="Enter your unredeemed code" value={coupon} onChange={event => { setCoupon(event.target.value.toUpperCase()); setCouponQuote(null); setAppliedCoupon(""); setError(""); }} /><button type="button" onClick={applyCoupon} disabled={!coupon.trim()}>{busy === "coupon" ? spinner : couponReady ? <><Check size={14} /> Applied</> : "Apply code"}</button></div><p className="mb-help">An eligible coupon can discount up to {discountSlotLimit} sessions.</p>{couponReady && <p className="mb-coupon-success" role="status"><CheckCircle2 size={14} /> Coupon applied.</p>}</div>
                    <div className="mb-field"><label htmlFor="mb-email"><span>Email address</span></label><input id="mb-email" type="email" autoComplete="email" required maxLength={254} value={email} placeholder="you@example.com" onChange={event => setEmail(event.target.value)} /></div>
                    <div className="mb-available"><ShieldCheck size={19} /><span>After booking, use your reference to track your booking and upload your payment slip.</span></div>
                    {total > 0 && <BankTransferInstructions details={setup?.bankTransfer} />}
                  </fieldset>
                  <div className="mb-form-action"><button className="mb-text-button" type="button" disabled={!!busy} onClick={cancel}><ArrowLeft size={15} /> {expired ? "Choose sessions again" : "Cancel"}</button><button className="mb-primary" type="submit" disabled={!!busy || expired || !couponReady}>{busy === "book" ? <>{spinner} Submitting...</> : <>Book sessions <ArrowRight size={16} /></>}</button></div>
                </form>
              </>}
            </section>
            <aside className="mb-summary mb-panel" aria-label="Booking summary"><div className="mb-summary-heading"><span>Booking summary</span><CalendarDays size={18} /></div><h3>{setup?.court.name || "Your next game"}</h3><div className="mb-summary-list"><div><span>Starting</span><strong>{startDate || "Choose a date"}</strong></div><div><span>Ending</span><strong>{finish || "Choose a duration"}</strong></div><div><span>Duration</span><strong>{weeks} {weeks === 1 ? "week" : "weeks"}</strong></div><div><span>Days</span><strong>{days.length ? days.map(day => day.slice(0, 3)).join(", ") : "Choose days"}</strong></div><div><span>Total sessions</span><strong>{hold?.bookingCount ?? availability?.bookingCount ?? weeks * days.length * slotIds.length}</strong></div></div><div className="mb-pricing"><div><span>{availability || hold ? "Original amount" : "Estimated amount"}</span><strong>{money(original)}</strong></div>{couponReady && <div className="mb-discount"><span>Coupon discount</span><strong>- {money(couponQuote.discountAmount)}</strong></div>}<div className="mb-total"><span>{couponReady ? "Final amount" : "Before coupon"}</span><strong>{money(total)}</strong></div></div><div className="mb-summary-note"><ShieldCheck size={18} /><span>{stage === "details" ? "Submit your booking before the hold expires." : "Check availability first, then reserve your sessions and add your coupon."}</span></div></aside>
          </div>
        )}
      </main>
      <footer className="mb-container mb-footer"><strong>KVK Arena</strong><a href="https://wa.me/94765605885" target="_blank" rel="noreferrer">Need a hand? Contact us <ArrowRight size={12} /></a></footer>
    </div>
  );
}

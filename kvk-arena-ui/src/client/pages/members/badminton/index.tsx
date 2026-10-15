import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, LoaderCircle, ShieldCheck, Ticket, Users } from "lucide-react";
import logo from "@/assets/badminton_logo.png";
import courtImage from "@/assets/court.png";
import { getEnv } from "@/env";
import { bookingError, checkMemberBooking, getMemberBookingSetup, checkAndHoldMemberBooking, quoteMemberCoupon, releaseMemberHold, type AvailabilityQuote, type BookingSetup, type BookingHold, type CouponQuote, type BookingConfirmation } from "@/services/member-badminton-api";
import { consecutiveSlots, countdown, endDate, isDate, maximumWeeks, money, remainingSeconds, slotLabel, sriLankaToday, validateSchedule, WEEKDAYS } from "./booking-utils";
import { pendingMemberPayment, resumeMemberPayment, startMemberCheckout } from "@/services/member-badminton-checkout";
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
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [stage, setStage] = useState<"schedule" | "details" | "success">("schedule");
  const [receipt, setReceipt] = useState<BookingConfirmation | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const lock = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const max = Math.min(configuredMax, setup?.maximumWeeks ?? configuredMax);
  const slots = setup?.slots ?? [];
  const selectedSlots = slots.filter(slot => slotIds.includes(slot.slotId));
  const finish = endDate(startDate, weeks);
  const seconds = hold ? remainingSeconds(deadline, now) : 0;
  const expired = !!hold && seconds === 0;
  const schedule = { startDate, weeks, slotIds, daysOfWeek: days };
  const original = hold?.originalAmount ?? availability?.originalAmount ?? selectedSlots.reduce((sum, slot) => sum + slot.price, 0) * weeks * days.length;
  const total = couponQuote?.finalAmount ?? original;
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
  function book() {
    if (!availability?.isAvailable) return;
    void run("hold", async () => {
      const reservation = await checkAndHoldMemberBooking(schedule).catch(reason => {
        setAvailability(null);
        throw reason;
      });
      setAvailability(reservation.availability);
      if (!reservation.hold) {
        setError("Some sessions are no longer available. Adjust your schedule and check again.");
        return;
      }
      const result = reservation.hold;
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
      const quote = await quoteMemberCoupon(hold.holdToken, code);
      setCouponQuote(quote); setAppliedCoupon(code);
    });
  }
  function paymentCallbacks() {
    return {
      onConfirmed: (result: BookingConfirmation) => { setReceipt(result); setStage("success"); setHold(null); setPaymentPending(false); setPaymentNotice(""); },
      onPending: () => {
        setPaymentPending(true); setPaymentNotice("Your payment is awaiting secure confirmation. Please do not pay again.");
      },
      onReversed: () => { setPaymentPending(false); setPaymentFailed(false); setPaymentNotice(""); setError(""); setNow(Date.now()); },
      onFailed: () => { setPaymentPending(false); setPaymentFailed(true); setError("Payment was not completed. Release this reservation and choose your sessions again."); },
      onExpired: () => { setPaymentPending(false); setPaymentFailed(true); setError("Checkout has expired. If you completed a payment, contact KVK Arena before paying again. Otherwise, choose your sessions again."); },
      onReview: () => { setPaymentPending(true); setPaymentNotice("Your payment was received and needs review. Please contact KVK Arena before paying again."); },
      onError: (reason: unknown) => { setError(bookingError(reason)); setPaymentPending(!!pendingMemberPayment()); },
    };
  }
  useEffect(() => {
    const pending = pendingMemberPayment();
    if (!pending?.view) return;
    const view = pending.view;
    setStartDate(view.schedule.startDate); setWeeks(view.schedule.weeks); setDays(view.schedule.daysOfWeek); setSlotIds(view.schedule.slotIds);
    setName(view.customerName); setPhone(view.phone); setEmail(view.email); setCouponQuote(view.quote);
    setHold(view.hold); setDeadline(view.deadline); setNow(Date.now()); setStage("details"); setPaymentPending(true);
    void resumeMemberPayment(paymentCallbacks());
  }, []);
  function confirm() {
    if (!hold || remainingSeconds(deadline) === 0 || !couponReady || paymentPending) return;
    if (!name.trim() || !/^\+?[0-9]{9,15}$/.test(phone) || !email.trim()) { setError("Enter your name, email and a valid phone number."); return; }
    void run("payment", async () => {
      await startMemberCheckout({ holdToken: hold.holdToken, customerName: name.trim(), phoneNumber: phone, couponCode: appliedCoupon, email: email.trim() },
        { schedule, hold, deadline, customerName: name.trim(), phone, email: email.trim(), quote: couponQuote! }, paymentCallbacks());
    });
  }
  function edit() {
    void run("release", async () => {
      if (hold) await releaseMemberHold(hold.holdToken);
      setHold(null); setCouponQuote(null); setAppliedCoupon(""); setAvailability(null); setPaymentFailed(false); setPaymentNotice(""); setStage("schedule");
    });
  }
  const spinner = <LoaderCircle size={16} className="mb-spin" />;

  return (
    <div className="member-badminton">
      <header className="mb-header">
        <img className="mb-header-court" src={courtImage} alt="" aria-hidden="true" />
        <div className="mb-container mb-header-content">
          <div className="mb-header-inner">
            <Link to="/" className="mb-header-brand" aria-label="KVK Arena home">
              <img src={logo} alt="KVK Badminton" />
              <span className="mb-header-brand-copy"><strong>KVK ARENA</strong><span>BADMINTON CLUB</span></span>
            </Link>
            <div className="mb-header-actions">
              <span className="mb-member-label"><ShieldCheck size={14} /> MEMBER RESERVATIONS</span>
              <Link to="/" className="mb-back"><ArrowLeft size={14} /><span>Back to Arena</span></Link>
            </div>
          </div>
          <div className="mb-header-title">
            <div>
              <p><span /> A COURT. A COMMITMENT. YOUR GAME.</p>
              <h1>Member court <em>reservations.</em></h1>
            </div>
            <span className="mb-header-members"><Users size={16} /><span>EXCLUSIVELY FOR<br /><strong>KVK MEMBERS</strong></span></span>
          </div>
        </div>
      </header>

      <main className="mb-container mb-booking-area">
        <nav className="mb-steps" aria-label="Booking progress">
          {["Your schedule", "Your details", "Confirmed"].map((label, index) => {
            const current = stage === "schedule" ? 0 : stage === "details" ? 1 : 2;
            return <span key={label} className={current === index ? "is-current" : current > index ? "is-complete" : ""} aria-current={current === index ? "step" : undefined}><i>{current > index ? <Check size={13} /> : `0${index + 1}`}</i>{label}{index < 2 && <ChevronRight size={14} />}</span>;
          })}
        </nav>
        {stage === "success" && receipt ? (
          <section className="mb-panel mb-success">
            <div className="mb-success-icon"><CheckCircle2 size={38} /></div>
            <p className="mb-eyebrow">SEE YOU ON COURT</p>
            <h2 ref={headingRef} tabIndex={-1}>Your sessions are confirmed.</h2>
            <p>{receipt.bookings.length} sessions at {setup?.court.name}. Your coupon has been redeemed.</p>
            <div className="mb-receipt">
              <div><span>Booked for</span><strong>{name}</strong></div>
              <div><span>Booking period</span><strong>{startDate} to {finish}</strong></div>
              <div><span>Schedule</span><strong>{days.join(", ")} · {weeks} weeks</strong></div>
              <div><span>Time</span><strong>{selectedSlots.map(slotLabel).join(", ")}</strong></div>
              <div><span>Final amount</span><strong>{money(receipt.finalAmount)}</strong></div>
            </div>
            <details className="mb-booking-references"><summary>View booking references</summary>{receipt.bookings.map(booking => <p key={booking.bookingNumber}><span>{booking.bookingDate}</span><code>{booking.bookingNumber}</code></p>)}</details>
            <p className="mb-help">Your payment and booking are confirmed. Keep your booking references for your visit.</p>
            <button className="mb-primary" onClick={() => { setStage("schedule"); setReceipt(null); setAvailability(null); setCouponQuote(null); setCoupon(""); setAppliedCoupon(""); setSlotIds([]); setPaymentFailed(false); }}>Book another schedule <ArrowRight size={16} /></button>
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
                    <div className="mb-court-display"><span className="mb-section-icon"><CalendarDays size={21} /></span><div><span>YOUR BOOKING COURT</span><strong>{setup?.court.name}</strong></div><span className="mb-court-status"><i /> Indoor court</span></div>
                    <div className="mb-input-row">
                      <div className="mb-field"><label htmlFor="mb-start">01 <span>First booking date</span></label><input id="mb-start" type="date" required min={minDate} value={startDate} onChange={event => { invalidate(); setStartDate(event.target.value); }} /></div>
                      <div className="mb-field"><label htmlFor="mb-weeks">02 <span>Duration</span></label><select id="mb-weeks" value={weeks} required onChange={event => { invalidate(); setWeeks(Number(event.target.value)); }}>{Array.from({ length: max }, (_, i) => i + 1).map(value => <option key={value} value={value}>{value} {value === 1 ? "week" : "weeks"}</option>)}</select><p className="mb-help">Up to {max} weeks per booking.</p></div>
                    </div>
                    <div className="mb-end-date"><CalendarDays size={16} /><span>Booking period ends</span><strong>{finish || "Choose a start date"}</strong></div>
                    <div className="mb-field"><label>03 <span>Days you want to play</span></label><div className="mb-days" role="group" aria-label="Days of the week">{WEEKDAYS.map(day => <button key={day} type="button" aria-label={day} aria-pressed={days.includes(day)} className={days.includes(day) ? "is-selected" : ""} onClick={() => { invalidate(); setDays(current => WEEKDAYS.filter(value => value === day ? !current.includes(day) : current.includes(value))); }}>{day.slice(0, 3)}</button>)}</div></div>
                    <div className="mb-field"><label>04 <span>Choose your time</span></label><p className="mb-help">Select consecutive slots. Prices shown are per session.</p><div className="mb-slots" role="group" aria-label="Time slots">{slots.map(slot => <button key={slot.slotId} type="button" aria-pressed={slotIds.includes(slot.slotId)} className={slotIds.includes(slot.slotId) ? "is-selected" : ""} onClick={() => toggleSlot(slot.slotId)}><Clock3 size={14} /><span>{slotLabel(slot)}<small className="mb-slot-price">{money(slot.price)}</small></span>{slotIds.includes(slot.slotId) && <Check size={14} />}</button>)}</div></div>
                  </fieldset>
                  {!!availability?.unavailableSchedules.length && <div className="mb-conflicts" role="status"><strong>Unavailable sessions</strong>{availability.unavailableSchedules.map((item, index) => <p key={`${item.date}-${item.slotId}-${index}`}>{item.date} · {item.slotName}<br />{item.message}</p>)}</div>}
                  {availability?.isAvailable ? <div className="mb-availability-ready"><div className="mb-available"><CheckCircle2 size={18} /><span>All {availability.bookingCount} sessions are available.</span></div><p className="mb-help">Book now to hold your sessions for seven minutes while you complete your details.</p><div className="mb-availability-actions"><button className="mb-cancel" type="button" disabled={!!busy} onClick={invalidate}>Cancel</button><button className="mb-primary" type="button" disabled={!!busy} onClick={book}>{busy === "hold" ? <>{spinner} Checking & reserving...</> : <>Book these sessions <ArrowRight size={16} /></>}</button></div></div> : <div className="mb-form-action"><span><ShieldCheck size={15} /> Every selected date is checked</span><button className="mb-primary" type="submit" disabled={!!busy || !slots.length || !!loadError}>{busy === "check" ? <>{spinner} Checking...</> : <>Check availability <ArrowRight size={16} /></>}</button></div>}
                </form>}
              </> : <>
                <div className={`mb-hold-timer ${expired || seconds <= 60 ? "is-urgent" : ""}`} role="timer" aria-label={expired ? "Reservation expired" : `${seconds} seconds remaining`}><Clock3 size={19} /><div><strong>{expired ? "Your hold has expired" : "Your sessions are reserved"}</strong><span>{expired ? "Check availability again to reserve your sessions." : "Complete your details before the timer ends."}</span></div><b>{countdown(seconds)}</b></div>
                {expired && !paymentPending && busy !== "payment" && <div className="mb-alert" role="alert">Your hold has expired. Check availability again before continuing.</div>}
                {paymentPending && <div className="mb-payment-pending" role="status"><ShieldCheck size={19} /><p>{paymentNotice || "Checking your payment confirmation..."}</p><button className="mb-primary" type="button" disabled={!!busy} onClick={() => { void run("verify", () => resumeMemberPayment(paymentCallbacks())); }}>{busy === "verify" ? <>{spinner} Checking...</> : "Check payment status"}</button></div>}
                <form onSubmit={event => { event.preventDefault(); confirm(); }}>
                  <fieldset className="mb-fields" disabled={!!busy || expired || paymentPending || paymentFailed}>
                    <div className="mb-input-row"><div className="mb-field"><label htmlFor="mb-name"><span>Full name</span></label><input id="mb-name" autoComplete="name" required maxLength={100} value={name} placeholder="Your full name" onChange={event => setName(event.target.value)} /></div><div className="mb-field"><label htmlFor="mb-phone"><span>Phone number</span></label><input id="mb-phone" type="tel" autoComplete="tel" required pattern="\+?[0-9]{9,15}" placeholder="0771234567" value={phone} onChange={event => setPhone(event.target.value.replace(/[^0-9+]/g, ""))} /></div></div>
                    <div className="mb-field"><label htmlFor="mb-coupon"><Ticket size={15} /><span>Coupon code <small>(required)</small></span></label><div className="mb-coupon-input"><input id="mb-coupon" autoComplete="off" required maxLength={100} placeholder="Enter your unredeemed code" value={coupon} onChange={event => { setCoupon(event.target.value.toUpperCase()); setCouponQuote(null); setAppliedCoupon(""); setError(""); }} /><button type="button" onClick={applyCoupon} disabled={!coupon.trim()}>{busy === "coupon" ? spinner : couponReady ? <><Check size={14} /> Applied</> : "Apply code"}</button></div><p className="mb-help">An eligible, unredeemed coupon is required. No member ID is needed.</p>{couponReady && <p className="mb-coupon-success" role="status"><CheckCircle2 size={14} /> Coupon verified. It will be redeemed when your booking is confirmed.</p>}</div>
                    <div className="mb-field"><label htmlFor="mb-email"><span>Email address</span></label><input id="mb-email" type="email" autoComplete="email" required maxLength={254} value={email} placeholder="you@example.com" onChange={event => setEmail(event.target.value)} /><p className="mb-help">Used for your secure payment checkout.</p></div>
                    <div className="mb-available"><ShieldCheck size={19} /><span>Secure online checkout with PayHere. Your booking is confirmed after payment verification.</span></div>
                  </fieldset>
                  <div className="mb-form-action"><button className="mb-text-button" type="button" disabled={!!busy || paymentPending} onClick={edit}><ArrowLeft size={15} /> {expired || paymentFailed ? "Choose sessions again" : "Release & edit schedule"}</button><button className="mb-primary" type="submit" disabled={!!busy || expired || !couponReady || paymentPending || paymentFailed}>{busy === "payment" ? <>{spinner} Opening checkout...</> : <>Pay {money(total)} <ArrowRight size={16} /></>}</button></div>
                </form>
              </>}
            </section>
            <aside className="mb-summary mb-panel" aria-label="Booking summary"><div className="mb-summary-heading"><span>YOUR RESERVATION</span><CalendarDays size={18} /></div><h3>{setup?.court.name || "Your next game"}</h3><p className="mb-summary-subtitle">A little consistency. A better game.</p><div className="mb-summary-list"><div><span>Starting</span><strong>{startDate || "Choose a date"}</strong></div><div><span>Ending</span><strong>{finish || "Choose a duration"}</strong></div><div><span>Duration</span><strong>{weeks} {weeks === 1 ? "week" : "weeks"}</strong></div><div><span>Days</span><strong>{days.length ? days.map(day => day.slice(0, 3)).join(", ") : "Choose days"}</strong></div><div><span>Total sessions</span><strong>{hold?.bookingCount ?? availability?.bookingCount ?? weeks * days.length * slotIds.length}</strong></div></div><div className="mb-pricing"><div><span>{availability || hold ? "Original amount" : "Estimated amount"}</span><strong>{money(original)}</strong></div>{couponReady && <div className="mb-discount"><span>Coupon discount</span><strong>- {money(couponQuote.discountAmount)}</strong></div>}<div className="mb-total"><span>{couponReady ? "Final amount" : "Before coupon"}</span><strong>{money(total)}</strong></div></div><div className="mb-summary-note"><ShieldCheck size={18} /><span>{stage === "details" ? "Your coupon is validated again when you confirm. Sessions are only held until the timer ends." : "Check availability first, then reserve your sessions and add your coupon."}</span></div></aside>
          </div>
        )}
      </main>
      <footer className="mb-container mb-footer"><span>KVK ARENA</span><span>MAKE EVERY GAME COUNT.</span><a href="https://wa.me/94765605885" target="_blank" rel="noreferrer">Need a hand? Contact us <ArrowRight size={12} /></a></footer>
    </div>
  );
}

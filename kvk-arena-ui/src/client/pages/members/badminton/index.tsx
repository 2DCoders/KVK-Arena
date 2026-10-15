import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import logo from "@/assets/badminton_logo.png";
import courtImage from "@/assets/court.png";
import { getEnv } from "@/env";
import { getCourts } from "@/services/court-api";
import {
  bookingError,
  checkMemberBooking,
  createMemberBooking,
  getMemberCourtSlots,
  type AvailabilityQuote,
  type MemberCourt,
  type MemberSlot,
} from "@/services/member-badminton-api";
import {
  consecutiveSlots,
  initialWeeks,
  isDate,
  MEMBER_PREFIX,
  minutes,
  money,
  slotLabel,
  sriLankaToday,
  validateSchedule,
  WEEKDAYS,
} from "./booking-utils";
import "./member-booking.css";

export default function MemberBadmintonBooking() {
  const env = getEnv();
  const today = sriLankaToday();
  const minDate =
    isDate(env.BADMINTON_BOOKING_START_DATE) &&
    env.BADMINTON_BOOKING_START_DATE > today
      ? env.BADMINTON_BOOKING_START_DATE
      : today;
  const [startDate, setStartDate] = useState(minDate);
  const [weeks, setWeeks] = useState(() =>
    initialWeeks(minDate, env.BOOKING_DURATION),
  );
  const [courts, setCourts] = useState<MemberCourt[]>([]);
  const [courtId, setCourtId] = useState("");
  const [slots, setSlots] = useState<MemberSlot[]>([]);
  const [days, setDays] = useState<string[]>(["Monday"]);
  const [slotIds, setSlotIds] = useState<string[]>([]);
  const [memberDigits, setMemberDigits] = useState("");
  const [coupon, setCoupon] = useState("");
  const [halfPayment, setHalfPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<1 | 2>(1);
  const [quote, setQuote] = useState<AvailabilityQuote | null>(null);
  const [stage, setStage] = useState<"schedule" | "review" | "success">(
    "schedule",
  );
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [receipt, setReceipt] = useState<{
    court: string;
    date: string;
    weeks: string;
    days: string[];
    times: string[];
    total: number;
    amount: number;
    member: string;
  } | null>(null);
  const requestLock = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const memberId = `${MEMBER_PREFIX}${memberDigits}`;
  const selectedCourt = courts.find((court) => court.id === courtId);
  const selectedSlots = slots.filter((slot) => slotIds.includes(slot.slotId));
  const total = Number(quote?.finalAmount ?? 0);
  const amount = halfPayment ? Math.ceil(total / 2) : total;
  const schedule = {
    courtId,
    startDate: `${startDate}T00:00:00`,
    numberOfSlots: Number(weeks),
    slotIds,
    daysOfWeek: days,
  };

  useEffect(() => {
    const title = document.title;
    document.title = "Member Badminton Booking | KVK Arena";
    window.scrollTo(0, 0);
    return () => {
      document.title = title;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    getCourts()
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data) || !data.length)
          throw new Error(
            "No courts are available right now. Please try again later.",
          );
        setCourts(data);
        setCourtId(data[0].id);
      })
      .catch((reason) => {
        if (active) setLoadError(bookingError(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  useEffect(() => {
    if (!courtId) return;
    const controller = new AbortController();
    setSlotsLoading(true);
    setSlots([]);
    setSlotIds([]);
    setLoadError("");
    getMemberCourtSlots(courtId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        const available = (Array.isArray(data) ? data : [])
          .filter(
            (slot) =>
              slot.courtId === courtId &&
              slot.slotId &&
              slot.startTime &&
              slot.endTime,
          )
          .sort((a, b) => minutes(a.startTime) - minutes(b.startTime));
        setSlots(available);
        if (!available.length)
          setLoadError("No time slots are available for this court.");
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setLoadError(bookingError(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });
    return () => controller.abort();
  }, [courtId, reload]);

  useEffect(() => {
    if (stage !== "schedule") {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    }
  }, [stage]);

  function invalidate() {
    setQuote(null);
    setError("");
  }
  function toggleSlot(id: string) {
    const next = slotIds.includes(id)
      ? slotIds.filter((value) => value !== id)
      : [...slotIds, id];
    if (next.length && !consecutiveSlots(next, slots)) {
      setError(
        "Select adjacent time slots. To remove a middle slot, first remove the slots after it.",
      );
      return;
    }
    invalidate();
    setSlotIds(next);
  }
  async function checkAvailability() {
    if (requestLock.current) return;
    const message = validateSchedule(
      startDate,
      minDate,
      weeks,
      days,
      slotIds,
      slots,
    );
    if (!courtId || message || !/^\d{4}$/.test(memberDigits)) {
      setError(
        message ||
          (!courtId
            ? "Choose a court."
            : "Enter the last four digits of your member ID."),
      );
      return;
    }
    requestLock.current = true;
    setBusy(true);
    setError("");
    setQuote(null);
    try {
      const result = await checkMemberBooking(
        schedule,
        memberId,
        coupon.trim().toUpperCase(),
      );
      if (
        ![
          result.originalAmount,
          result.discountAmount,
          result.finalAmount,
        ].every((value) => Number.isFinite(Number(value))) ||
        Number(result.finalAmount) < 0
      )
        throw new Error("Pricing could not be verified. Please try again.");
      setQuote(result);
      if (result.isAvailable) setStage("review");
      else
        setError(
          "Some selected sessions are unavailable. Adjust your schedule and try again.",
        );
    } catch (reason) {
      setError(bookingError(reason));
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }
  async function confirm() {
    if (requestLock.current || !quote?.isAvailable) return;
    requestLock.current = true;
    setBusy(true);
    setError("");
    try {
      await createMemberBooking({
        ...schedule,
        memberId,
        couponCode: coupon.trim().toUpperCase(),
        paymentType,
        isHalfPayment: halfPayment,
        amount,
      });
      setReceipt({
        court: selectedCourt?.name || "Badminton court",
        date: startDate,
        weeks,
        days: [...days],
        times: selectedSlots.map(slotLabel),
        total,
        amount,
        member: memberId,
      });
      setStage("success");
      setQuote(null);
    } catch (reason) {
      setError(bookingError(reason));
      setQuote(null);
      setStage("schedule");
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

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
      <main>
        <div className="mb-container mb-booking-area">
          <nav className="mb-steps" aria-label="Booking progress">
            {["Your schedule", "Review & confirm", "You're booked"].map(
              (label, index) => {
                const current =
                  stage === "schedule" ? 0 : stage === "review" ? 1 : 2;
                return (
                  <span
                    key={label}
                    className={
                      current === index
                        ? "is-current"
                        : current > index
                          ? "is-complete"
                          : ""
                    }
                    aria-current={current === index ? "step" : undefined}
                  >
                    <i>
                      {current > index ? <Check size={13} /> : `0${index + 1}`}
                    </i>
                    {label}
                    {index < 2 && <ChevronRight size={14} />}
                  </span>
                );
              },
            )}
          </nav>
          {stage === "success" && receipt ? (
            <section className="mb-panel mb-success">
              <div className="mb-success-icon">
                <CheckCircle2 size={38} />
              </div>
              <p className="mb-eyebrow">SEE YOU ON COURT</p>
              <h2 ref={headingRef} tabIndex={-1}>
                Your booking is confirmed.
              </h2>
              <p>Your recurring sessions at {receipt.court} are reserved.</p>
              <div className="mb-receipt">
                <div>
                  <span>Member</span>
                  <strong>{receipt.member}</strong>
                </div>
                <div>
                  <span>Starting</span>
                  <strong>{receipt.date}</strong>
                </div>
                <div>
                  <span>Schedule</span>
                  <strong>
                    {receipt.days.join(", ")} · {receipt.weeks} weeks
                  </strong>
                </div>
                <div>
                  <span>Time</span>
                  <strong>{receipt.times.join(", ")}</strong>
                </div>
                <div>
                  <span>Booking total</span>
                  <strong>{money(receipt.total)}</strong>
                </div>
                <div>
                  <span>Selected payment amount</span>
                  <strong>{money(receipt.amount)}</strong>
                </div>
              </div>
              <p className="mb-help">
                Keep a copy of these details for your records.
              </p>
              <button
                className="mb-primary"
                onClick={() => {
                  setStage("schedule");
                  setSlotIds([]);
                  setError("");
                }}
              >
                Make another booking <ArrowRight size={16} />
              </button>
            </section>
          ) : (
            <div className="mb-layout">
              <div className="mb-form-column">
                <section className="mb-panel">
                  <div className="mb-panel-heading">
                    <span className="mb-section-icon">
                      {stage === "schedule" ? (
                        <CalendarDays size={20} />
                      ) : (
                        <ShieldCheck size={20} />
                      )}
                    </span>
                    <div>
                      <h2 ref={headingRef} tabIndex={-1}>
                        {stage === "schedule"
                          ? "Build your schedule"
                          : "Review your reservation"}
                      </h2>
                      <p>
                        {stage === "schedule"
                          ? "Choose when you play. We'll check the entire period."
                          : "Your schedule is available. Check your details below."}
                      </p>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-alert" role="alert">
                      {error}
                    </div>
                  )}
                  {loadError && (
                    <div className="mb-alert" role="alert">
                      {loadError}
                      <button
                        type="button"
                        onClick={() => setReload((value) => value + 1)}
                      >
                        Try again
                      </button>
                    </div>
                  )}
                  {stage === "schedule" ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void checkAvailability();
                      }}
                    >
                      <fieldset
                        disabled={busy || loading || slotsLoading}
                        className="mb-fields"
                      >
                        <div className="mb-field">
                          <label htmlFor="mb-court">
                            01 <span>Select your court</span>
                          </label>
                          {loading ? (
                            <p className="mb-loading" role="status">
                              <LoaderCircle size={16} /> Loading courts...
                            </p>
                          ) : (
                            <select
                              id="mb-court"
                              value={courtId}
                              onChange={(event) => {
                                invalidate();
                                setCourtId(event.target.value);
                              }}
                            >
                              {!courts.length && (
                                <option value="">No courts available</option>
                              )}
                              {courts.map((court) => (
                                <option key={court.id} value={court.id}>
                                  {court.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="mb-input-row">
                          <div className="mb-field">
                            <label htmlFor="mb-start">
                              02 <span>First booking date</span>
                            </label>
                            <input
                              id="mb-start"
                              type="date"
                              required
                              min={minDate}
                              value={startDate}
                              onChange={(event) => {
                                invalidate();
                                setStartDate(event.target.value);
                              }}
                            />
                          </div>
                          <div className="mb-field">
                            <label htmlFor="mb-weeks">
                              03 <span>Duration in weeks</span>
                            </label>
                            <input
                              id="mb-weeks"
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={weeks}
                              onChange={(event) => {
                                invalidate();
                                setWeeks(event.target.value);
                              }}
                            />
                            <p className="mb-help">
                              Sessions repeat each week.
                            </p>
                          </div>
                        </div>
                        <div className="mb-field">
                          <label>
                            04 <span>Days you want to play</span>
                          </label>
                          <div
                            className="mb-days"
                            role="group"
                            aria-label="Days of the week"
                          >
                            {WEEKDAYS.map((day) => (
                              <button
                                key={day}
                                type="button"
                                aria-label={day}
                                aria-pressed={days.includes(day)}
                                className={
                                  days.includes(day) ? "is-selected" : ""
                                }
                                onClick={() => {
                                  invalidate();
                                  setDays((current) =>
                                    WEEKDAYS.filter((value) =>
                                      value === day
                                        ? !current.includes(day)
                                        : current.includes(value),
                                    ),
                                  );
                                }}
                              >
                                {day.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-field">
                          <label>
                            05 <span>Choose your time</span>
                          </label>
                          <p className="mb-help">
                            Select one or more consecutive slots.
                          </p>
                          {slotsLoading ? (
                            <p className="mb-loading" role="status">
                              <LoaderCircle size={16} /> Finding time slots...
                            </p>
                          ) : (
                            <div
                              className="mb-slots"
                              role="group"
                              aria-label="Time slots"
                            >
                              {slots.map((slot) => (
                                <button
                                  key={slot.slotId}
                                  type="button"
                                  aria-pressed={slotIds.includes(slot.slotId)}
                                  className={
                                    slotIds.includes(slot.slotId)
                                      ? "is-selected"
                                      : ""
                                  }
                                  onClick={() => toggleSlot(slot.slotId)}
                                >
                                  <Clock3 size={14} />
                                  <span>{slotLabel(slot)}</span>
                                  {slotIds.includes(slot.slotId) && (
                                    <Check size={14} />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mb-member-fields">
                          <div className="mb-field">
                            <label htmlFor="mb-member">
                              06 <span>Your member ID</span>
                            </label>
                            <div className="mb-member-input">
                              <span>{MEMBER_PREFIX}</span>
                              <input
                                id="mb-member"
                                inputMode="numeric"
                                autoComplete="off"
                                required
                                pattern="[0-9]{4}"
                                maxLength={4}
                                placeholder="0000"
                                value={memberDigits}
                                onChange={(event) => {
                                  invalidate();
                                  setMemberDigits(
                                    event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4),
                                  );
                                }}
                              />
                            </div>
                            <p className="mb-help">
                              Enter the last four digits of your registered
                              member ID.
                            </p>
                          </div>
                          <div className="mb-field">
                            <label htmlFor="mb-coupon">
                              <Ticket size={15} />
                              <span>
                                Coupon <small>(optional)</small>
                              </span>
                            </label>
                            <input
                              id="mb-coupon"
                              autoComplete="off"
                              placeholder="Enter your code"
                              value={coupon}
                              onChange={(event) => {
                                invalidate();
                                setCoupon(event.target.value.toUpperCase());
                              }}
                            />
                          </div>
                        </div>
                      </fieldset>
                      {!!quote?.unavailableSchedules?.length && (
                        <div className="mb-conflicts" role="status">
                          <strong>Unavailable sessions</strong>
                          {quote.unavailableSchedules.map((item, index) => (
                            <p key={`${item.slotId}-${index}`}>
                              {item.dayOfWeek} {item.slotName} — {item.message}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="mb-form-action">
                        <span>
                          <ShieldCheck size={15} /> Availability checked before
                          confirmation
                        </span>
                        <button
                          className="mb-primary"
                          type="submit"
                          disabled={
                            busy ||
                            loading ||
                            slotsLoading ||
                            !slots.length ||
                            !!loadError
                          }
                        >
                          {busy ? (
                            <>
                              <LoaderCircle size={16} className="mb-spin" />{" "}
                              Checking...
                            </>
                          ) : (
                            <>
                              Check availability <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="mb-available">
                        <CheckCircle2 size={18} /> Your selected schedule is
                        available.
                      </div>
                      <dl className="mb-review-details">
                        <div>
                          <dt>Member ID</dt>
                          <dd>{memberId}</dd>
                        </div>
                        <div>
                          <dt>Court</dt>
                          <dd>{selectedCourt?.name}</dd>
                        </div>
                        <div>
                          <dt>First booking date</dt>
                          <dd>{startDate}</dd>
                        </div>
                        <div>
                          <dt>Duration</dt>
                          <dd>{weeks} weeks</dd>
                        </div>
                        <div>
                          <dt>Every week</dt>
                          <dd>{days.join(", ")}</dd>
                        </div>
                        <div>
                          <dt>Time</dt>
                          <dd>{selectedSlots.map(slotLabel).join(", ")}</dd>
                        </div>
                        {coupon && (
                          <div>
                            <dt>Coupon</dt>
                            <dd>{coupon}</dd>
                          </div>
                        )}
                      </dl>
                      <fieldset className="mb-fields" disabled={busy}>
                        <div className="mb-field">
                          <label>Payment plan</label>
                          <div className="mb-payment-options">
                            {[false, true].map((half) => (
                              <button
                                key={String(half)}
                                type="button"
                                className={
                                  halfPayment === half ? "is-selected" : ""
                                }
                                aria-pressed={halfPayment === half}
                                onClick={() => setHalfPayment(half)}
                              >
                                <span>
                                  {half ? "Half payment" : "Full payment"}
                                </span>
                                <strong>
                                  {money(half ? Math.ceil(total / 2) : total)}
                                </strong>
                                <small>
                                  {half
                                    ? "50% of the booking total"
                                    : "Complete booking amount"}
                                </small>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-field">
                          <label>Payment method</label>
                          <div
                            className="mb-methods"
                            role="group"
                            aria-label="Payment method"
                          >
                            <button
                              type="button"
                              aria-pressed={paymentType === 1}
                              className={paymentType === 1 ? "is-selected" : ""}
                              onClick={() => setPaymentType(1)}
                            >
                              Cash
                            </button>
                            <button
                              type="button"
                              aria-pressed={paymentType === 2}
                              className={paymentType === 2 ? "is-selected" : ""}
                              onClick={() => setPaymentType(2)}
                            >
                              Card
                            </button>
                          </div>
                          <p className="mb-help">
                            No online card payment is taken on this page.
                          </p>
                        </div>
                      </fieldset>
                      <div className="mb-form-action">
                        <button
                          className="mb-text-button"
                          disabled={busy}
                          onClick={() => {
                            setStage("schedule");
                            invalidate();
                          }}
                        >
                          <ArrowLeft size={15} /> Edit schedule
                        </button>
                        <button
                          className="mb-primary"
                          disabled={busy}
                          onClick={() => void confirm()}
                        >
                          {busy ? (
                            <>
                              <LoaderCircle size={16} className="mb-spin" />{" "}
                              Confirming...
                            </>
                          ) : (
                            <>
                              Confirm booking <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </section>
              </div>
              <aside
                className="mb-summary mb-panel"
                aria-label="Booking summary"
              >
                <div className="mb-summary-heading">
                  <span>YOUR RESERVATION</span>
                  <CalendarDays size={18} />
                </div>
                <h3>{selectedCourt?.name || "Your next game"}</h3>
                <p className="mb-summary-subtitle">
                  A little consistency. A better game.
                </p>
                <div className="mb-summary-list">
                  <div>
                    <span>Starting</span>
                    <strong>{startDate || "Choose a date"}</strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{weeks || "0"} weeks</strong>
                  </div>
                  <div>
                    <span>Days</span>
                    <strong>
                      {days.length
                        ? days.map((day) => day.slice(0, 3)).join(", ")
                        : "Choose days"}
                    </strong>
                  </div>
                  <div>
                    <span>Weekly time slots</span>
                    <strong>{slotIds.length}</strong>
                  </div>
                  <div>
                    <span>Total sessions</span>
                    <strong>
                      {Number.isSafeInteger(Number(weeks)) && Number(weeks) > 0
                        ? Number(weeks) * days.length * slotIds.length
                        : 0}
                    </strong>
                  </div>
                </div>
                {quote?.isAvailable ? (
                  <div className="mb-pricing">
                    <div>
                      <span>Original amount</span>
                      <strong>{money(Number(quote.originalAmount))}</strong>
                    </div>
                    {Number(quote.discountAmount) > 0 && (
                      <div className="mb-discount">
                        <span>Discount</span>
                        <strong>- {money(Number(quote.discountAmount))}</strong>
                      </div>
                    )}
                    <div className="mb-total">
                      <span>Booking total</span>
                      <strong>{money(total)}</strong>
                    </div>
                    <div>
                      <span>Selected payment</span>
                      <strong>{money(amount)}</strong>
                    </div>
                    {halfPayment && (
                      <div>
                        <span>Remaining balance</span>
                        <strong>{money(total - amount)}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mb-price-placeholder">
                    Your price and eligible discounts will appear after checking
                    availability.
                  </p>
                )}
                <div className="mb-summary-note">
                  <ShieldCheck size={18} />
                  <span>
                    Every selected day and time repeats throughout your booking
                    period.
                  </span>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <footer className="mb-container mb-footer">
        <span>KVK ARENA</span>
        <span>MAKE EVERY GAME COUNT.</span>
        <a href="https://wa.me/94765605885" target="_blank" rel="noreferrer">
          Need a hand? Contact us <ArrowRight size={12} />
        </a>
      </footer>
    </div>
  );
}

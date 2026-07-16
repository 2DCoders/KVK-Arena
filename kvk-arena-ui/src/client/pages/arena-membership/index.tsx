import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  Clock3,
  Coffee,
  Dumbbell,
  Gamepad2,
  Info,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { getEnv } from "@/env";

import gymImage from "@/assets/gym-signup.jpg";
import MembershipRegistration from "@/components/membership-registration";
import Alert from "@/components/alert";

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const OFFER_FALLBACK_END = getEnv().OFFER_END_DATE;
const MEMBERSHIP_PRICE = getEnv().MEMBERSHIP_PRICE;
const GYM_RATE = getEnv().GYM_RATE;
const BADMINTON_RATE = getEnv().BADMINTON_RATE;
const CARWASH_RATE = getEnv().CARWASH_RATE;
const GAMING_RATE = getEnv().GAMING_RATE;
const CAFE_RATE = getEnv().CAFE_RATE;

function getTimeLeft(targetTime: number): TimeLeft {
  const total = Math.max(0, targetTime - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { total, days, hours, minutes, seconds };
}

function formatPrice(value: string | number | undefined) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return value || "0";
  }

  return numericValue.toLocaleString("en-LK");
}

function formatPercentage(value: string | number | undefined) {
  if (value === undefined || value === null || value === "") {
    return "0%";
  }

  const stringValue = String(value).trim();

  return stringValue.includes("%") ? stringValue : `${stringValue}%`;
}

export default function ArenaMembership() {
  const offerEndDate = new Date(OFFER_FALLBACK_END);
  const targetTime = offerEndDate.getTime();

  const infoPanelRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(targetTime),
  );
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [showRateInfo, setShowRateInfo] = useState(false);

  const [pageAlert, setPageAlert] = useState<{
    visible: boolean;
    variant?: "success" | "error" | "warning" | "info";
    title?: string;
    description?: string;
  }>({
    visible: false,
  });

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetTime));

    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetTime));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetTime]);

  useEffect(() => {
    if (!showRateInfo) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        infoPanelRef.current &&
        !infoPanelRef.current.contains(event.target as Node)
      ) {
        setShowRateInfo(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowRateInfo(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showRateInfo]);

  const membershipBenefits = [
    "Discounts for every service",
    "Annual renewal option",
    "Priority registration handling",
    "WhatsApp follow-up after signup",
  ];

  const serviceRates = [
    {
      name: "Gym & Fitness",
      description: "Discount on gym services and eligible packages.",
      rate: GYM_RATE,
      icon: Dumbbell,
    },
    {
      name: "Badminton",
      description: "Discount on eligible court booking charges.",
      rate: BADMINTON_RATE,
      icon: Trophy,
    },
    {
      name: "Carwash",
      description: "Discount on eligible vehicle wash services.",
      rate: CARWASH_RATE,
      icon: Car,
    },
    {
      name: "Gaming Centre",
      description: "Discount on eligible gaming reservations.",
      rate: GAMING_RATE,
      icon: Gamepad2,
    },
    {
      name: "Cafe",
      description: "Discount on eligible cafe purchases.",
      rate: CAFE_RATE,
      icon: Coffee,
    },
  ];

  const isOfferActive = timeLeft.total > 0;

  if (!isOfferActive) {
    return null;
  }

  return (
    <section
      id="memberships"
      className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-28"
    >
      {pageAlert.visible && (
        <Alert
          variant={pageAlert.variant}
          title={pageAlert.title}
          description={pageAlert.description}
          onClose={() =>
            setPageAlert((current) => ({
              ...current,
              visible: false,
            }))
          }
        />
      )}

      <MembershipRegistration
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        onSuccess={() =>
          setPageAlert({
            visible: true,
            variant: "success",
            title: "Registration Successful",
            description:
              "Your membership application has been submitted successfully. Our team will contact you shortly.",
          })
        }
        onFailure={() =>
          setPageAlert({
            visible: true,
            variant: "error",
            title: "Registration Failed",
            description:
              "There was an issue submitting your membership application. Please try again later.",
          })
        }
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${gymImage})` }}
      />

      <div className="absolute inset-0 bg-slate-950/68" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(41,107,225,0.32),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.96))]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          {/* Left Content */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#296BE1]/35 bg-[#296BE1]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#CFEFFF] backdrop-blur-sm">
              <Sparkles size={14} />
              Limited Time Offer
            </div>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-6xl">
              Full Arena Membership
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Join the full arena membership and unlock exclusive discounts
              across our services, with an annual membership plan designed for
              customers who want more value from every visit.
            </p>

            {/* Eye-catching Membership Price */}
            <div className="mt-7 max-w-xl overflow-hidden rounded-3xl border border-[#61A5FA]/30 bg-gradient-to-r from-[#296BE1]/25 via-[#296BE1]/10 to-white/5 p-px shadow-[0_24px_60px_rgba(41,107,225,0.18)]">
              <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-slate-950/75 px-5 py-5 backdrop-blur-xl sm:px-6">
                <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#296BE1]/25 blur-3xl" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#8FC0FF]/20 bg-[#296BE1]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A9D1FF]">
                      <Sparkles size={12} />
                      Annual Membership
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-300">
                      One payment. Benefits across the arena.
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Membership price
                    </p>

                    <div className="mt-1 flex items-end gap-2 sm:justify-end">
                      <span className="pb-1 text-sm font-bold text-[#8FC0FF]">
                        LKR
                      </span>

                      <span className="bg-gradient-to-r from-white to-[#8FC0FF] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
                        {formatPrice(MEMBERSHIP_PRICE)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Valid for one year
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits and Info Button */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {membershipBenefits.map((benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur-sm"
                >
                  <BadgeCheck size={16} className="text-[#8FC0FF]" />
                  {benefit}
                </span>
              ))}

              <div ref={infoPanelRef} className="relative">
                <button
                  type="button"
                  aria-label="View membership discount rates"
                  aria-expanded={showRateInfo}
                  onClick={() => setShowRateInfo((current) => !current)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#8FC0FF]/35 bg-[#296BE1]/15 px-4 py-2 text-sm font-semibold text-[#CFEFFF] transition hover:border-[#8FC0FF]/60 hover:bg-[#296BE1]/25"
                >
                  <Info size={16} />
                  Discount Rates
                </button>

                {/* Desktop Info Popover */}
                {showRateInfo && (
                  <div className="absolute bottom-[calc(100%+12px)] left-0 z-30 hidden w-[420px] overflow-hidden rounded-3xl border border-white/15 bg-slate-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:block">
                    <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8FC0FF]">
                          Member Discounts
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-white">
                          Service discount rates
                        </h3>
                      </div>

                      <button
                        type="button"
                        aria-label="Close discount information"
                        onClick={() => setShowRateInfo(false)}
                        className="cursor-pointer rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-3 p-4">
                      {serviceRates.map((service) => {
                        const Icon = service.icon;

                        return (
                          <div
                            key={service.name}
                            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#296BE1]/20 text-[#8FC0FF]">
                              <Icon size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-white">
                                {service.name}
                              </p>

                              <p className="mt-0.5 text-xs leading-5 text-slate-400">
                                {service.description}
                              </p>
                            </div>

                            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-center">
                              <p className="text-lg font-black text-emerald-300">
                                {formatPercentage(service.rate)}
                              </p>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/75">
                                Off
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-white/10 bg-white/3 px-5 py-3">
                      <p className="text-xs leading-5 text-slate-400">
                        Discounts apply only to eligible services and may not be
                        combined with selected promotions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Info Panel */}
            {showRateInfo && (
              <div className="mt-5 overflow-hidden rounded-3xl border border-white/15 bg-slate-950/90 shadow-2xl backdrop-blur-2xl sm:hidden">
                <div className="flex items-start justify-between border-b border-white/10 px-4 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8FC0FF]">
                      Member Discounts
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-white">
                      Service discount rates
                    </h3>
                  </div>

                  <button
                    type="button"
                    aria-label="Close discount information"
                    onClick={() => setShowRateInfo(false)}
                    className="cursor-pointer rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  {serviceRates.map((service) => {
                    const Icon = service.icon;

                    return (
                      <div
                        key={service.name}
                        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#296BE1]/20 text-[#8FC0FF]">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">
                            {service.name}
                          </p>

                          <p className="mt-0.5 text-xs leading-5 text-slate-400">
                            {service.description}
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-2 text-center">
                          <p className="font-black text-emerald-300">
                            {formatPercentage(service.rate)}
                          </p>

                          <p className="text-[9px] font-bold uppercase text-emerald-400/75">
                            Off
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Countdown Card */}
          <div
            data-aos="fade-left"
            data-aos-delay="200"
            className="relative"
          >
            <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-[#296BE1]/20 blur-3xl" />
            <div className="absolute -right-6 bottom-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/8 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8FC0FF]">
                    Offer Countdown
                  </p>

                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {isOfferActive
                      ? `${timeLeft.days} days left`
                      : "Offer closed"}
                  </h3>
                </div>

                <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Offer end
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {offerEndDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-center shadow-[0_20px_55px_rgba(0,0,0,0.22)]"
                  >
                    <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {String(item.value).padStart(2, "0")}
                    </div>

                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-[#296BE1]/25 bg-black/55 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#296BE1] text-white shadow-[0_14px_32px_rgba(41,107,225,0.32)]">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8FC0FF]">
                      Registration notes
                    </p>

                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      Complete your registration today and our admin team will
                      contact you through WhatsApp to confirm the membership and
                      payment details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setRegistrationOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#296BE1] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(41,107,225,0.3)] transition hover:-translate-y-0.5 hover:bg-[#2158bc]"
                >
                  Register Now
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowRateInfo((current) => !current)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Info size={16} />
                  View Discounts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
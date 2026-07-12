import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Sparkles, X } from "lucide-react";
import { createPortal } from "react-dom";
import { getEnv } from "@/env";

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const PROMO_COUNTDOWN_STORAGE_KEY = "kvk-promo-countdown-dismissed";
const OFFER_END_DATE = getEnv().OFFER_END_DATE;

function getTimeLeft(targetTime: number): TimeLeft {
  const total = Math.max(0, targetTime - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { total, days, hours, minutes, seconds };
}

function formatTime(value: number) {
  return String(value).padStart(2, "0");
}

type PromoCountdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PromoCountdownModal({
  isOpen,
  onClose,
}: PromoCountdownModalProps) {
  const targetTime = useMemo(() => new Date(OFFER_END_DATE).getTime(), []);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(targetTime),
  );

  useEffect(() => {
    const updateCountdown = () => setTimeLeft(getTimeLeft(targetTime));

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [targetTime]);

  useEffect(() => {
  if (timeLeft.total <= 0) {
      onClose();
  }
  }, [onClose, timeLeft.total]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    window.localStorage.setItem(PROMO_COUNTDOWN_STORAGE_KEY, "true");
    onClose();
  };

  if (typeof document === "undefined") return null;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50000 flex items-center overflow-y-auto justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md">
      <div className="promo-card relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0848A6] text-white shadow-[0_25px_90px_rgba(29,16,112,0.55)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(255,188,64,0.2),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))]" />
        <div className="absolute -right-10 top-5 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-8 bottom-8 h-24 w-24 rounded-full bg-[#ff9f1a]/20 blur-2xl" />

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close offer popup"
          className="absolute right-3 top-3 z-1000 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition duration-300 hover:rotate-90 hover:bg-black/35"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 px-6 pb-6 pt-7 sm:px-7 sm:pt-8">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur-sm">
            <Sparkles size={14} />
            Limited Time Offer
          </div>

          <h2 className="mt-5 text-center text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-4xl">
            Full Arena Membership
            <span className="block text-white/95">Registration Open!!!</span>
          </h2>

          <div className="mt-6 rounded-[22px] bg-[#ff8a00] px-4 py-4 text-slate-950 shadow-[0_16px_30px_rgba(255,147,0,0.34)] sm:px-5">
            <div className="grid grid-cols-4 gap-2 text-center sm:gap-3">
              {[
                [formatTime(timeLeft.days), "DAY"],
                [formatTime(timeLeft.hours), "HOU"],
                [formatTime(timeLeft.minutes), "MIN"],
                [formatTime(timeLeft.seconds), "SEC"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#ffd24d] px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:px-3"
                >
                  <div className="text-2xl font-black tracking-[-0.06em] sm:text-[2rem]">
                    {value}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 sm:text-[11px]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-sm text-center text-sm leading-7 text-white/88 sm:text-[15px]">
            Sign up now to secure your full arena membership at a special
            discounted rate. This exclusive offer is only available for a
            limited time, so act fast and join the KVK Arena community today!
          </p>

          <a
            href="#add"
            onClick={handleClose}
            className="mt-6
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[#ffd24d]
            px-5
            py-3.5
            text-sm
            font-bold
            text-slate-950
            shadow-xl
            transition-all
            duration-300
            hover:scale-105
            hover:shadow-2xl
            active:scale-95
            animate-pulse"
          >
            Start
            <ArrowRight size={18} />
          </a>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-white/70">
            <Clock3 size={14} />
            Offer ends soon
          </div>
        </div>
      </div>

      <style>{`
        .promo-card {
          animation: promo-pop 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }

        .promo-launcher {
          animation: promo-float 2.8s ease-in-out infinite;
        }

        .promo-launcher-ring {
          animation: promo-ping 1.8s ease-out infinite;
        }

        @keyframes promo-pop {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes promo-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes promo-ping {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.18);
            opacity: 0;
          }
          100% {
            transform: scale(1.18);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .promo-card,
          .promo-launcher,
          .promo-launcher-ring {
            animation: none;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}

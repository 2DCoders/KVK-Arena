import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import logo from "@/assets/badminton_logo.png";

export default function MemberBadmintonBooking() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Member Badminton Booking | KVK Arena";
    window.scrollTo(0, 0);
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-[#0d0805] text-orange-50">
      <header className="border-b border-orange-200/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <Link to="/" aria-label="KVK Arena home">
            <img src={logo} alt="KVK Badminton" className="h-16 w-auto max-w-36 object-contain" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-orange-100/70 transition hover:text-orange-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300">
            <ArrowLeft size={16} /> Back to Arena
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-16">
        <section aria-labelledby="member-booking-title" className="w-full rounded-3xl border border-orange-200/10 bg-[radial-gradient(ellipse_at_top,rgba(217,139,77,0.1),transparent_65%)] px-6 py-16 text-center sm:px-12 sm:py-24">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d98b4d]/30 bg-[#d98b4d]/10 text-[#f1b17b]">
            <CalendarDays size={28} aria-hidden="true" />
          </div>
          <p className="mb-4 text-[10px] font-semibold tracking-[0.25em] text-[#f1b17b]">KVK MEMBERS</p>
          <h1 id="member-booking-title" className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Badminton Court Booking</h1>
          {/* Replace this placeholder with the member booking content when supplied. */}
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-orange-100/55">Member booking details will be available here soon.</p>
        </section>
      </main>

      <footer className="px-6 py-6 text-center text-[10px] tracking-[0.2em] text-orange-100/40">KVK ARENA · BADMINTON</footer>
    </div>
  );
}

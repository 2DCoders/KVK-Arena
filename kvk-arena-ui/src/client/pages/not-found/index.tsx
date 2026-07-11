import {
  ArrowLeft,
  ArrowRight,
  Home,
  SearchX,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(41,107,225,0.28),transparent_26%),radial-gradient(circle_at_85%_80%,rgba(239,68,68,0.16),transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#020617_100%)]"
      />

      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      {/* Decorative blur circles */}
      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-red-500/10 blur-[110px]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
          {/* Content */}
          <section className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14 xl:p-16">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              <SearchX size={15} />
              Page not found
            </div>

            <div className="mt-7">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
                Error 404
              </p>

              <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl">
                Looks like this page stepped outside the arena.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                We could not find{" "}
                <span className="break-all font-semibold text-white">
                  {location.pathname}
                </span>
                . The link may be outdated, moved, or entered incorrectly.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
              >
                <Home size={17} />
                Back to Home
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.12]"
              >
                <ArrowLeft size={17} />
                Go Back
              </button>
            </div>

            <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-400">
              <Sparkles size={16} className="text-blue-400" />
              <span>Gym, badminton, gaming, car wash and more.</span>
            </div>
          </section>

          {/* 404 Visual */}
          <section className="relative hidden min-h-[620px] overflow-hidden border-l border-white/10 lg:flex lg:items-center lg:justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(41,107,225,0.22),transparent_48%)]"
            />

            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            />

            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/20"
            />

            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-2xl"
            />

            <div className="relative z-10 text-center">
              <div className="relative">
                <p className="select-none text-[180px] font-black leading-none tracking-[-0.1em] text-white xl:text-[220px]">
                  404
                </p>

                <div className="absolute inset-x-0 bottom-1/2 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
              </div>

              <div className="mx-auto mt-6 w-fit rounded-full border border-white/10 bg-white/[0.07] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 backdrop-blur-xl">
                KVK Arena
              </div>

              <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-slate-400">
                This destination is currently unavailable, but the main arena
                is only one click away.
              </p>
            </div>

            {/* Decorative cards */}
            <div className="absolute left-10 top-16 rotate-[-8deg] rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-xl backdrop-blur-xl">
              <div className="h-2 w-20 rounded-full bg-blue-400/60" />
              <div className="mt-3 h-2 w-12 rounded-full bg-white/15" />
            </div>

            <div className="absolute bottom-16 right-10 rotate-[8deg] rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-xl backdrop-blur-xl">
              <div className="h-2 w-16 rounded-full bg-red-400/50" />
              <div className="mt-3 h-2 w-24 rounded-full bg-white/15" />
            </div>
          </section>

          {/* Mobile 404 visual */}
          <section className="relative border-t border-white/10 px-6 py-10 text-center lg:hidden">
            <p className="text-[100px] font-black leading-none tracking-[-0.08em] text-white/10 sm:text-[140px]">
              404
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              KVK Arena
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
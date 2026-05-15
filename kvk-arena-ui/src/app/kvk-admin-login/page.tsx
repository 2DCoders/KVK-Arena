import Link from "next/link";
import { adminLoginBenefits, adminLoginTheme, publicNavigation } from "@/lib/site-content";

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b16] text-white">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${adminLoginTheme.accent} opacity-50`}
      />
      <div
        className={`pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full ${adminLoginTheme.orb} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full ${adminLoginTheme.orb} blur-3xl`}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-8">
        <header className={`rounded-[1.5rem] border ${adminLoginTheme.border} bg-white/5 px-5 py-4 backdrop-blur-xl`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/45">Admin access</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">KVK Arena login</h1>
            </div>

            <nav className="flex flex-wrap gap-2 text-sm text-white/70">
              {publicNavigation.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/8 bg-white/5 px-4 py-2 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="grid flex-1 gap-8 py-10 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-16">
          <section className="space-y-6">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${adminLoginTheme.chip}`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              Protected admin entrypoint
            </div>

            <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              <span className={`bg-gradient-to-r ${adminLoginTheme.accent} bg-clip-text text-transparent`}>
                Sign in to manage bookings, services, and future routes.
              </span>
            </h2>

            <p className="max-w-2xl text-lg leading-8 text-white/70">
              This login page is intentionally separate from the public marketing pages so the
              future admin area can grow without changing the public URLs.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {adminLoginBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <article key={benefit.title} className={`rounded-[1.5rem] border ${adminLoginTheme.border} bg-white/5 p-5 backdrop-blur-xl`}>
                    <div className={`inline-flex rounded-2xl p-3 ${adminLoginTheme.chip}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">{benefit.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={`rounded-[2rem] border ${adminLoginTheme.border} bg-white/6 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl`}>
            <form className="space-y-5 rounded-[1.6rem] border border-white/8 bg-slate-950/30 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">Admin sign in</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Welcome back</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Authentication logic can be connected later. This screen establishes the route,
                  structure, and visual treatment now.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/75">Email</span>
                <input
                  type="email"
                  placeholder="admin@kvkarena.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-cyan-300/40 focus:bg-white/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/75">Password</span>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-cyan-300/40 focus:bg-white/10"
                />
              </label>

              <div className="flex items-center justify-between text-sm text-white/60">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent" />
                  Remember me
                </label>
                <button type="button" className="font-medium text-cyan-200 transition hover:text-cyan-100">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                Sign in
                <span aria-hidden="true">→</span>
              </button>

              <p className="text-center text-xs leading-5 text-white/45">
                More admin routes can be added later without changing this public login URL.
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
import Link from "next/link";
import { publicNavigation, type PageContent } from "@/lib/site-content";

type SitePageProps = {
  content: PageContent;
};

export function SitePage({ content }: SitePageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${content.theme.accent} opacity-60`}
      />
      <div
        className={`pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full ${content.theme.orb} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full ${content.theme.orb} blur-3xl`}
      />

      <header className={`relative z-10 border-b ${content.theme.border} bg-white/4 backdrop-blur-xl`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-semibold tracking-[0.3em] text-cyan-100 ring-1 ring-white/10 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              KVK
            </span>
            <span>
              <span className="block text-sm uppercase tracking-[0.36em] text-white/55">
                Arena Network
              </span>
              <span className="block text-lg font-semibold text-white">
                KVK Arena
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap gap-2 text-sm text-white/75 lg:justify-end">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/8 bg-white/4 px-4 py-2 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${content.theme.chip}`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              {content.eyebrow}
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className={`bg-gradient-to-r ${content.theme.accent} bg-clip-text text-transparent`}>
                {content.title}
              </span>
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              {content.description}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={content.primaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px] hover:bg-cyan-100"
              >
                {content.primaryCta.label}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={content.secondaryCta.href}
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/26 hover:bg-white/10"
              >
                {content.secondaryCta.label}
              </Link>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-white/55">{content.summaryText}</p>
          </div>

          <div className={`rounded-[2rem] border ${content.theme.border} ${content.theme.panel} p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl`}>
            <div className="space-y-4 rounded-[1.6rem] border border-white/8 bg-slate-950/25 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                  {content.summaryTitle}
                </p>
                <p className="mt-3 text-base leading-7 text-white/78">{content.summaryText}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {content.stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/6 p-4">
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className={`rounded-[1.75rem] border ${content.theme.border} ${content.theme.panel} p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20`}
              >
                <div className={`inline-flex rounded-2xl p-3 ${content.theme.chip}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/66">{feature.description}</p>
              </article>
            );
          })}
        </section>

        <section className={`grid gap-8 rounded-[2rem] border ${content.theme.border} ${content.theme.panel} p-8 backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center`}>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              {content.highlightsTitle}
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/72">
              {content.highlights.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/25 p-6 lg:min-w-[280px]">
            <h3 className="text-lg font-semibold text-white">{content.panelTitle}</h3>
            <p className="text-sm leading-6 text-white/68">{content.panelText}</p>
            <Link
              href={content.primaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              {content.primaryCta.label}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-white/55 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>KVK Arena website foundation for service pages and future admin routes.</p>
          <Link href="/kvk-admin-login" className="inline-flex items-center gap-2 text-white/80 transition hover:text-white">
            Admin login <span aria-hidden="true">→</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
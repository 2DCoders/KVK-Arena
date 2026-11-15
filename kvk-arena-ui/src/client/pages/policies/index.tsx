import { useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/kvk-arena-header-logo1.png";
import { policies, type PolicyKey } from "./content";

export default function PolicyPage({ policy }: { policy: PolicyKey }) {
  const content = policies[policy];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${content.title} | KVK Arena`;
    window.scrollTo(0, 0);
    return () => { document.title = previousTitle; };
  }, [content.title]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <a href="#policy-content" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to policy</a>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link to="/" aria-label="KVK Arena home"><img src={logo} alt="KVK Arena" className="h-12 w-auto" /></Link>
          <Link to="/" className="text-sm text-blue-300 underline underline-offset-4">Back to home</Link>
        </div>
      </header>
      <main id="policy-content" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">KVK Arena · Policies</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{content.title}</h1>
        <p className="mt-5 max-w-3xl leading-7 text-slate-300">{content.intro}</p>
        <p className="mt-4 text-sm text-slate-400">Draft updated: 15 November 2026 · Effective date pending approval</p>
        <aside className="mt-8 rounded-xl border border-amber-300/30 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100">
          Draft for review. Business details and operating procedures still need confirmation before this policy is finalized.
        </aside>
        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav aria-label="Policies" className="self-start rounded-xl border border-white/10 p-4 lg:sticky lg:top-6">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Our policies</p>
            {Object.entries(policies).map(([key, item]) => (
              <Link key={key} to={item.path} aria-current={key === policy ? "page" : undefined}
                className={`block rounded-lg px-3 py-3 text-sm transition ${key === policy ? "bg-blue-500/15 text-blue-200" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                {item.title}
              </Link>
            ))}
          </nav>
          <article className="min-w-0 space-y-9">
            {content.sections.map(([title, body], index) => (
              <section key={title} aria-labelledby={`policy-section-${index}`}>
                <h2 id={`policy-section-${index}`} className="text-xl font-semibold">{index + 1}. {title}</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-8 text-slate-300">{body}</p>
              </section>
            ))}
            <section className="rounded-xl border border-white/10 bg-white/5 p-6" aria-labelledby="policy-contact">
              <h2 id="policy-contact" className="text-xl font-semibold">Contact KVK Arena</h2>
              <address className="mt-3 space-y-2 text-sm not-italic leading-7 text-slate-300">
                <p>387 Galle Road, Colombo-04, Sri Lanka</p>
                <p><a className="text-blue-300 underline underline-offset-4" href="mailto:info@kvkarena.lk">info@kvkarena.lk</a></p>
                <p><a className="text-blue-300 underline underline-offset-4" href="tel:+94765605885">+94 76 560 5885</a></p>
              </address>
            </section>
          </article>
        </div>
      </main>
      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-slate-400">© {new Date().getFullYear()} KVK Arena. All rights reserved.</footer>
    </div>
  );
}

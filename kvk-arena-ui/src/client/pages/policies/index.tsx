import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3, FileText, List, Mail, MapPin, Phone, RotateCcw, ShieldCheck } from "lucide-react";
import logo from "@/assets/kvk-arena-header-logo1.png";
import { policies, type PolicyKey } from "./content";
import "./policies.css";

const presentation = {
  privacy: { icon: ShieldCheck, label: "Your information, explained.", summary: "Understand the information we collect, how we use it and how to reach us about your data." },
  terms: { icon: FileText, label: "Know before you book.", summary: "A clear guide to bookings, membership access and making the most of your time at the arena." },
  refund: { icon: RotateCcw, label: "Clear plans. Clear policies.", summary: "Everything to know about non-refundable payments, rescheduling and getting help from our team." },
};

export default function PolicyPage({ policy }: { policy: PolicyKey }) {
  const content = policies[policy];
  const design = presentation[policy];
  const Icon = design.icon;
  const [activeSection, setActiveSection] = useState(0);
  const minutes = Math.max(1, Math.ceil(content.sections.reduce((sum, [, body]) => sum + body.split(/\s+/).length, 0) / 200));

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${content.title} | KVK Arena`;
    window.scrollTo(0, 0);
    setActiveSection(0);
    const sections = document.querySelectorAll(".policy-section");
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(Number(visible[0].target.getAttribute("data-section")));
    }, { rootMargin: "-100px 0px -45% 0px", threshold: 0 });
    sections.forEach(section => observer.observe(section));
    return () => { document.title = previousTitle; observer.disconnect(); };
  }, [content]);

  const sectionLinks = content.sections.map(([title], index) => (
    <a key={title} href={`#policy-section-${index}`} aria-current={activeSection === index ? "location" : undefined}>
      <span>{String(index + 1).padStart(2, "0")}</span>{title}
    </a>
  ));

  return (
    <div className="policy-page">
      <a href="#policy-content" className="policy-skip">Skip to policy</a>
      <header className="policy-header">
        <div className="policy-shell policy-header-inner">
          <Link to="/" aria-label="KVK Arena home" className="policy-brand"><img src={logo} alt="KVK Arena" /></Link>
          <Link to="/" className="policy-home"><ArrowLeft size={15} />Back to arena</Link>
        </div>
      </header>
      <main id="policy-content">
        <section className="policy-hero" aria-labelledby="policy-title">
          <div className="policy-shell policy-hero-inner">
            <div className="policy-eyebrow"><span /> KVK ARENA / LEGAL & SUPPORT</div>
            <div className="policy-hero-grid">
              <div>
                <p className="policy-kicker">{design.label}</p>
                <h1 id="policy-title">{content.title}</h1>
                <p className="policy-hero-description">{design.summary}</p>
                <div className="policy-meta"><span><Clock3 size={14} />{minutes} min read</span><span>Updated 15 Nov 2026</span><span><Check size={14} />Effective upon publication</span></div>
              </div>
              <div className="policy-hero-emblem" aria-hidden="true"><div><Icon size={66} strokeWidth={1.1} /></div><span>KVK ARENA</span></div>
            </div>
          </div>
        </section>
        <div className="policy-tabs-wrap">
          <nav className="policy-shell policy-tabs" aria-label="Policies">
            {Object.entries(policies).map(([key, item]) => {
              const TabIcon = presentation[key as PolicyKey].icon;
              return <Link key={key} to={item.path} aria-current={key === policy ? "page" : undefined}><TabIcon size={18} /><span>{item.title}</span><ArrowUpRight size={15} className="policy-tab-arrow" /></Link>;
            })}
          </nav>
        </div>
        <div className="policy-shell policy-body">
          <aside className="policy-sidebar">
            <div className="policy-sidebar-sticky">
              <nav className="policy-desktop-toc" aria-label="On this page"><p className="policy-small-label">ON THIS PAGE</p><div className="policy-toc">{sectionLinks}</div></nav>
              <div className="policy-help"><div className="policy-help-icon"><Mail size={20} /></div><h2>A little clarity?</h2><p>Our team can help with questions about this policy.</p><a href="mailto:info@kvkarena.lk">Talk to our team<ArrowUpRight size={16} /></a></div>
            </div>
          </aside>
          <div className="policy-document">
            <details className="policy-mobile-toc" key={policy}><summary><List size={18} />On this page<span>{content.sections.length} sections</span></summary><nav aria-label="Policy sections" className="policy-toc">{sectionLinks}</nav></details>
            <div className="policy-document-intro"><span className="policy-small-label">THE DETAILS</span><p>{content.intro}</p></div>
            <article aria-label={content.title}>
              {content.sections.map(([title, body], index) => <section className="policy-section" id={`policy-section-${index}`} data-section={index} key={title} aria-labelledby={`policy-heading-${index}`}><span className="policy-section-number">{String(index + 1).padStart(2, "0")}</span><div><h2 id={`policy-heading-${index}`}>{title}</h2><p>{body.split(/(https:\/\/www\.payhere\.lk\/privacy\/)/g).map((part, i) => part === "https://www.payhere.lk/privacy/" ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">PayHere Privacy Policy</a> : part)}</p></div></section>)}
            </article>
            <section className="policy-contact" aria-labelledby="policy-contact-title"><div><span className="policy-small-label">WE ARE HERE TO HELP</span><h2 id="policy-contact-title">Let&apos;s clear things up.</h2><p>For policy questions, booking changes or account support, contact KVK Arena administration.</p></div><address><a href="mailto:info@kvkarena.lk"><Mail size={18} /><span>info@kvkarena.lk</span><ArrowUpRight size={16} /></a><a href="tel:+94765605885"><Phone size={18} /><span>+94 76 560 5885</span><ArrowUpRight size={16} /></a><p><MapPin size={18} /><span>387 Galle Road, Colombo-04,<br />Sri Lanka</span></p></address></section>
            <div className="policy-bottom-link"><Link to="/">Explore KVK Arena<ArrowRight size={17} /></Link><a href="#policy-title">Back to top &uarr;</a></div>
          </div>
        </div>
      </main>
      <footer className="policy-footer"><div className="policy-shell"><p>&copy; {new Date().getFullYear()} KVK Arena. All rights reserved.</p><span>Play. Connect. Belong.</span></div></footer>
    </div>
  );
}

import { Phone } from "lucide-react";

export default function GymPaymentNotice({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-2xl border border-blue-300/40 bg-[#0d2144] p-5 text-white sm:p-6">
      <h3 className="text-xl font-extrabold leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-blue-100">{description}</p>
      <a href="tel:+94765605885" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-200 px-4 py-2 text-sm font-extrabold text-slate-950 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <Phone size={17} aria-hidden="true" /> Call +94 76 560 5885
      </a>
    </section>
  );
}

import heroImage from "@/assets/hero/gym-hero.png";

const services = [
  {
    title: "Gym",
    subtitle: "Strength and functional training",
    description: "Coach-led sessions, recovery corners, and a premium workout floor.",
  },
  {
    title: "Carwash",
    subtitle: "Fast and detailed vehicle care",
    description: "Drop in before training and collect your ride spotless after your session.",
  },
  {
    title: "Badminton Court",
    subtitle: "Professional indoor courts",
    description: "Book singles or doubles slots with smooth surfaces and bright lighting.",
  },
  {
    title: "Gaming Centre",
    subtitle: "Console and esports lounge",
    description: "Compete, unwind, and host game nights with high-speed connectivity.",
  },
];

const stats = [
  { value: "4", label: "Core experiences" },
  { value: "7 days", label: "Open weekly" },
  { value: "1 app", label: "One booking flow" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fefcf8] py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(251,191,36,0.2),transparent_36%),radial-gradient(circle_at_90%_8%,rgba(56,189,248,0.18),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#fdf8f0_42%,#fffdf9_100%)]" />
      <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />
      <div className="absolute -right-20 bottom-4 h-64 w-64 rounded-full bg-sky-100/80 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1fr_1.05fr] lg:px-8">
        <div className="hero-fade-up max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            KVK Arena Lifestyle Hub
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            One arena for
            <span className="block bg-gradient-to-r from-sky-700 via-slate-900 to-amber-600 bg-clip-text text-transparent">
              movement, care, play.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Explore four connected experiences in a modern light-space design: Gym, Carwash, Badminton Court, and Gaming Centre. Book faster, move easier, and keep your day flowing in one place.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800">
              Plan Your Visit
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-400">
              View Facilities
            </button>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]"
              >
                <div className="text-2xl font-black tracking-[-0.03em] text-slate-950">{item.value}</div>
                <div className="mt-1 text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-fade-up-delay relative">
          <div className="rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Featured Zones</p>
              <p className="text-xs font-medium text-slate-500">Gym • Carwash • Court • Gaming</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service, index) => (
                <article
                  key={service.title}
                  className="hero-service-card overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <img
                    src={heroImage}
                    alt={`${service.title} preview`}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{service.subtitle}</p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.02em] text-slate-900">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-fade-up {
          opacity: 0;
          transform: translateY(26px);
          animation: hero-fade-up 700ms ease forwards;
        }

        .hero-fade-up-delay {
          opacity: 0;
          transform: translateY(26px);
          animation: hero-fade-up 760ms ease forwards;
          animation-delay: 140ms;
        }

        .hero-service-card {
          opacity: 0;
          transform: translateY(20px) scale(0.985);
          animation: hero-service-enter 620ms ease forwards;
          transition: transform 280ms ease, box-shadow 280ms ease;
        }

        .hero-service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.13);
        }

        @keyframes hero-fade-up {
          0% {
            opacity: 0;
            transform: translateY(26px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hero-service-enter {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up,
          .hero-fade-up-delay,
          .hero-service-card {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }

        @media (max-width: 640px) {
          .hero-service-card img {
            height: 148px;
          }
        }
      `}</style>
    </section>
  );
}
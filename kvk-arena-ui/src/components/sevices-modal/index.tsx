import { X, Dumbbell, Car, Trophy, Gamepad2, Coffee } from "lucide-react";

import gymHero from "@/assets/about.png";
import badmintonHero from "@/assets/about2.jpg";

interface ServicesModalProps {
  open: boolean;
  onClose: () => void;
}

const services = [
  {
    title: "Gym & Fitness",
    icon: Dumbbell,
    highlight: "Training, strength, and recovery",
    description:
      "Train in a modern fitness space built for strength, cardio, and active recovery. KVK Arena's gym is designed to support regular workouts, focused sessions, and an easy training routine for members at every level. The atmosphere is built for consistency, so members can move from warm-up to workout without friction.",
  },
  {
    title: "Car Wash",
    icon: Car,
    highlight: "Quick care with a polished finish",
    description:
      "Keep your vehicle clean and ready with our professional car wash service. From wash and shine care to a polished finish, we help you maintain a spotless look with reliable, hassle-free service. It is a practical stop for drivers who want a clean result without spending extra time or energy.",
  },
  {
    title: "Badminton Courts",
    icon: Trophy,
    highlight: "Fast indoor play",
    description:
      "Book a fast-paced indoor court for practice, friendly matches, or competitive play. Our badminton space is set up for comfort, movement, and a great experience every time you step on court. The court flow is designed to keep games smooth, energetic, and enjoyable for every type of player.",
  },
  {
    title: "Gaming Centre",
    icon: Gamepad2,
    highlight: "A focused space to relax and play",
    description:
      "Relax and play in a dedicated gaming zone with a premium setup. It is a space built for casual gaming, group sessions, and a fun break between your other activities at the arena. The setup gives players a place to unwind, compete, and enjoy their time in a comfortable environment.",
  },
  {
    title: "Café",
    icon: Coffee,
    highlight: "Refreshments between activities",
    description:
      "Take a break at the café with coffee, snacks, and light refreshments in a cozy setting. It is the ideal stop to recharge before or after your workout, game, or sports session. The café completes the arena experience by turning a quick pause into a relaxed part of the visit.",
  },
];

export default function ServicesModal({
  open,
  onClose,
}: ServicesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50000 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 h-full overflow-y-auto">
        <div className="mx-auto min-h-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#f6f8fc] shadow-[0_30px_90px_rgba(2,6,23,0.4)]">
            <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-6 px-5 py-4 sm:px-7 sm:py-5">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#296BE1]">
                    KVK Arena Journal
                  </p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                    One arena, five connected experiences
                  </h1>
                  {/* <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    A closer look at how KVK Arena brings fitness, sport,
                    cleaning, entertainment, and refreshments into a single
                    modern destination.
                  </p> */}
                </div>

                <button
                  onClick={onClose}
                  className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Close services article"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
                <div className="overflow-hidden rounded-3xl bg-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                  <div className="relative aspect-video">
                    <img
                      src={gymHero}
                      alt="KVK Arena gym and fitness space"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                      <h2 className="mt-4 max-w-2xl text-xl font-black text-white sm:text-2xl lg:text-3xl">
                        A connected space built for people who want to move,
                        play, and get things done in one visit.
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-6 text-[15px] leading-8 text-slate-600 sm:text-base">
                  <p>
                    KVK Arena is designed as a multi-purpose destination where
                    everyday routines feel easier. Instead of splitting a day
                    across multiple places, members can train, play, clean,
                    relax, and recharge under one roof. That simple idea shapes
                    the whole experience: less travel, less waiting, and more
                    time spent doing what matters.
                  </p>

                  <p>
                    The space is organized to feel smooth from the first step
                    inside. Clear booking, comfortable facilities, and a modern
                    look help create an experience that feels practical without
                    losing personality. Whether someone is visiting for a quick
                    workout or staying longer for a match and a coffee, the
                    arena is built to keep the flow natural.
                  </p>

                  <p>
                    What makes KVK Arena different is the way the services work
                    together. Fitness supports discipline, badminton brings
                    energy, gaming adds downtime, the café creates a social
                    pause, and the car wash adds convenience. The result is a
                    place that feels less like separate businesses and more
                    like one connected lifestyle hub.
                  </p>

                  <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3 sm:p-6">
                    {[
                      ["5", "Services under one roof"],
                      ["24/7", "Convenient booking flow"],
                      ["100%", "Member-first focus"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-2xl font-black tracking-tight text-[#296BE1]">
                          {value}
                        </div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <section className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-950 sm:text-2xl">
                      Service guide
                    </h3>
                    <p>
                      Each service is designed to solve a different part of the
                      day while keeping the overall experience consistent.
                    </p>

                    <div className="space-y-4">
                      {services.map((service) => {
                        const Icon = service.icon;

                        return (
                          <article
                            key={service.title}
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#296BE1]/10 text-[#296BE1]">
                                <Icon className="h-7 w-7" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h4 className="text-lg font-bold text-slate-950 sm:text-xl">
                                    {service.title}
                                  </h4>
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                                    {service.highlight}
                                  </span>
                                </div>

                                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </article>

              <aside className="border-t border-slate-200 bg-white px-5 py-6 sm:px-7 lg:border-l lg:border-t-0 lg:px-8 lg:py-10">
                <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-1">
                  <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                      Editorial note
                    </p>
                    <p className="mt-4 text-base leading-8 text-white/86">
                      KVK Arena is built for visitors who want variety without
                      complexity. The article-like layout reflects that idea:
                      clear sections, readable paragraphs, and a calm visual
                      rhythm that works on phones and desktops.
                    </p>

                    <div className="mt-6 overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
                      <img
                        src={badmintonHero}
                        alt="KVK Arena badminton court"
                        className="h-52 w-full object-cover"
                      />
                    </div>

                    <div className="mt-6 space-y-3 text-sm leading-7 text-white/76">
                      <p>
                        The gym supports strength and consistency.
                      </p>
                      <p>
                        Badminton adds speed and competition.
                      </p>
                      <p>
                        Gaming gives the arena a relaxed social layer.
                      </p>
                      <p>
                        The café and car wash complete the everyday utility.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
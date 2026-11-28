import { getEnv } from "@/env";
import cafe from "@/assets/coffee.jpg";
import badminton from "@/assets/badminton-mobile.png";
import salon from "@/assets/salon-mobile.png";
import gaming from "@/assets/gaming/ps5-lounge.png";
import gym from "@/assets/gym-mobile-hero.png";
import carWash from "@/assets/carwash-mobile.png";

export default function ComingSoonNotice() {
  const env = getEnv();
  const upcoming = [
    { active: env.CAFE_COMING_SOON, title: "KVK Cafe", description: "A new spot to catch up over coffee.", image: cafe },
    { active: env.BADMINTON_COMING_SOON, title: "KVK Badminton", description: "Your next rally starts here.", image: badminton },
    { active: env.SALON_COMING_SOON, title: "B Style Salon", description: "A fresh look is just around the corner.", image: salon },
    { active: env.GAMING_COMING_SOON, title: "KVK Gaming", description: "A new place to play together.", image: gaming },
    { active: env.GYM_COMING_SOON, title: "KVK Gym", description: "A new space to train and get stronger.", image: gym },
    { active: env.CARWASH_COMING_SOON, title: "KVK Car Wash", description: "A fresh finish for your next drive.", image: carWash },
  ].filter(item => item.active);
  if (upcoming.length === 0) return null;

  return (
    <section aria-labelledby="arena-coming-soon" className="relative isolate overflow-hidden border-y border-blue-900/50 bg-[#060e24] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,#204790_0%,#101f42_37%,#060e24_76%)]" />
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-300/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.17em] text-blue-200">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-blue-300" />
            Coming soon at KVK Arena
          </p>
          <h2 id="arena-coming-soon" className="text-balance text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.98] tracking-[-0.055em]">
            Your next favourite <span className="text-blue-300">is on its way.</span>
          </h2>
        </header>

        <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {upcoming.map(item => (
            <li key={item.title} className="relative isolate flex min-h-52 min-w-0 max-w-md flex-[1_1_100%] flex-col justify-end overflow-hidden rounded-2xl border border-blue-300/25 bg-[#101f42] px-5 py-4 min-[480px]:basis-[calc(50%_-_0.5rem)] md:min-h-60 md:basis-[calc((100%_-_2rem)/3)] xl:basis-[calc((100%_-_4rem)/5)]">
              <img src={item.image} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-[#060e24] from-8% via-[#060e24]/75 via-48% to-[#142d64]/10" />
              <span aria-hidden="true" className="mb-2.5 h-0.5 w-6 rounded-full bg-blue-300" />
              <h3 className="text-lg font-extrabold leading-tight">{item.title}</h3>
              <p className="mt-1 text-sm leading-snug text-blue-100">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

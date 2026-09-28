import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  Gem,
  Hand,
  Palette,
  Scissors,
  Sparkles,
  Star,
  UserRound,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";

type SalonService = {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  image: string;
  price: number;
  duration: number;
  summary: string;
  description: string;
  popular?: boolean;
};

const SALON_SERVICES: SalonService[] = [
  {
    id: "haircut-styling",
    name: "Haircut & Styling",
    category: "Hair",
    icon: Scissors,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    price: 1500,
    duration: 45,
    summary: "Precision cuts and finishing styled to suit your face and look.",
    description:
      "A full consultation, wash, precision cut and blow-dry finish tailored to your hair type and lifestyle. Our stylists take the time to understand the look you want before the first snip, so you leave with a cut that's easy to style and built to last between visits.",
    popular: true,
  },
  {
    id: "hair-coloring",
    name: "Hair Coloring",
    category: "Hair",
    icon: Palette,
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    price: 4500,
    duration: 90,
    summary: "Full colour, balayage or root touch-up with premium products.",
    description:
      "From a subtle root touch-up to a complete colour transformation, our colourists use premium, low-ammonia formulas to protect hair health while delivering rich, long-lasting tone. Includes a patch test, colour consultation and a nourishing post-colour treatment.",
  },
  {
    id: "facial-treatment",
    name: "Facial Treatment",
    category: "Skin",
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    price: 3500,
    duration: 60,
    summary: "Deep cleansing facial that leaves skin refreshed and glowing.",
    description:
      "A relaxing, deep-cleansing facial built around your skin type — cleansing, exfoliation, extraction, mask and moisturise. Designed to brighten dull skin, calm irritation and leave you with a healthy, natural glow you can see immediately.",
    popular: true,
  },
  {
    id: "manicure-pedicure",
    name: "Manicure & Pedicure",
    category: "Nails",
    icon: Hand,
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    price: 2800,
    duration: 75,
    summary: "Hand and foot care with shaping, buffing and polish.",
    description:
      "A full hand and foot treatment including soak, exfoliation, cuticle care, shaping and your choice of polish finish. A relaxing pause that leaves your hands and feet looking neat, cared for and camera-ready.",
  },
  {
    id: "deep-tissue-massage",
    name: "Deep Tissue Massage",
    category: "Body",
    icon: Waves,
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    price: 5000,
    duration: 60,
    summary: "Targeted massage to release tension and relax the body.",
    description:
      "A firm, targeted massage designed to work through muscle tension and everyday stress. Our therapists focus on problem areas while keeping the session comfortable, leaving you loose, calm and recharged.",
  },
  {
    id: "bridal-makeup",
    name: "Bridal Makeup",
    category: "Makeup",
    icon: Gem,
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
    price: 12000,
    duration: 120,
    summary: "Full bridal look with trial, styling and long-lasting finish.",
    description:
      "A complete bridal beauty experience — pre-event trial, skin prep, HD makeup application and hairstyling designed to photograph beautifully and last the whole event. Every detail is planned around your outfit, venue and personal style.",
    popular: true,
  },
  {
    id: "beard-grooming",
    name: "Beard Grooming",
    category: "Grooming",
    icon: UserRound,
    image:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=800&q=80",
    price: 1200,
    duration: 30,
    summary: "Sharp beard trim and shape with a hot towel finish.",
    description:
      "A precision beard trim and shape-up finished with a hot towel and skin-friendly balm. Quick, sharp and reliable — perfect on its own or paired with a haircut for a complete refresh.",
  },
  {
    id: "hair-spa-keratin",
    name: "Hair Spa & Keratin",
    category: "Hair",
    icon: Droplets,
    image:
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=800&q=80",
    price: 6500,
    duration: 100,
    summary: "Deep-repair spa and smoothing treatment for damaged hair.",
    description:
      "An intensive repair treatment combining a nourishing hair spa massage with a smoothing keratin infusion. Ideal for dry, frizzy or damaged hair — it restores softness, cuts down styling time and leaves hair visibly smoother for weeks.",
  },
];

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
};

const scrollToBooking = () => {
  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
};

export default function SalonServices() {
  const [selectedService, setSelectedService] = useState<SalonService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -640 : 640,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff,#faf5ff,#f5f0ff)] py-14 sm:py-20 lg:py-24">
      {/* Ambient purple glow */}
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-purple-300/25 blur-[110px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-[110px] sm:h-96 sm:w-96" />

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* =========================================
            HEADER
        ========================================= */}
        <div className="mx-auto mb-10 max-w-[800px] text-center sm:mb-14 lg:mb-16">
          <div className="mb-6 flex items-center justify-center gap-4 sm:mb-7">
            <span className="h-px w-10 bg-purple-300 sm:w-12" />

            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-purple-600 sm:text-[11px]">
              Our Services
            </span>

            <span className="h-px w-10 bg-purple-300 sm:w-12" />
          </div>

          <h2 className="font-sans text-[34px] font-medium leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-[50px] lg:text-[64px]">
            Pamper Yourself
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
              with Our Expert
            </span>
            <br />
            Services
          </h2>

          <p className="mx-auto mt-6 max-w-[600px] text-sm leading-6 text-slate-500 sm:mt-8 sm:text-base">
            Discover a refined collection of beauty and grooming experiences,
            carefully crafted to help you look your best and feel even better.
          </p>
        </div>

        {/* =========================================
            SCROLL CONTROLS
        ========================================= */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll services left"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-purple-200 bg-white text-purple-600 shadow-sm transition-all hover:-translate-y-1 hover:border-purple-400 hover:bg-purple-50 sm:h-12 sm:w-12"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll services right"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-purple-200 bg-white text-purple-600 shadow-sm transition-all hover:-translate-y-1 hover:border-purple-400 hover:bg-purple-50 sm:h-12 sm:w-12"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* =========================================
            SERVICES — HORIZONTAL SCROLL
        ========================================= */}
        <div
          ref={scrollRef}
          className="mt-4 flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide sm:gap-6"
        >
          {SALON_SERVICES.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.id}
                className="group relative flex min-w-[240px] max-w-[240px] shrink-0 flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-[0_10px_30px_rgba(124,58,237,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(124,58,237,0.16)] sm:min-w-[300px] sm:max-w-[300px]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />

                  {service.popular && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-purple-700 shadow-sm">
                      <Star size={10} className="fill-purple-600 text-purple-600" />
                      Popular
                    </span>
                  )}

                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-purple-600 shadow-sm">
                    <Icon size={16} />
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-500">
                    {service.category}
                  </p>

                  <h3 className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg">
                    {service.name}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
                    {service.summary}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 sm:text-sm">
                      <Clock3 size={13} className="text-purple-500" />
                      {formatDuration(service.duration)}
                    </div>

                    <div className="text-base font-black text-purple-700 sm:text-lg">
                      Rs. {service.price.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 text-xs font-bold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100 sm:text-sm"
                  >
                    View Details
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selectedService &&
        createPortal(
          <ServiceDetailsModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />,
          document.body
        )}
    </section>
  );
}

function ServiceDetailsModal({
  service,
  onClose,
}: {
  service: SalonService;
  onClose: () => void;
}) {
  const Icon = service.icon;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_100px_rgba(88,28,135,0.35)]">
        <div className="relative h-52 shrink-0 sm:h-64">
          <img
            src={service.image}
            alt={service.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close service details"
            className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
          >
            <X size={17} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-purple-600 shadow-sm">
              <Icon size={18} />
            </span>

            <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-700 shadow-sm">
              {service.category}
            </span>

            {service.popular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                <Star size={10} className="fill-white text-white" />
                Popular
              </span>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
            {service.name}
          </h3>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600">
              <Clock3 size={15} className="text-purple-500" />
              {formatDuration(service.duration)}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="text-lg font-black text-purple-700">
              Rs. {service.price.toLocaleString()}
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[15px]">
            {service.description}
          </p>

          <button
            type="button"
            onClick={() => {
              onClose();
              scrollToBooking();
            }}
            className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-500 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(124,58,237,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(124,58,237,0.42)]"
          >
            Book This Service
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImageOff,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { getSalonServiceItems } from "@/services/salon-service-api";

type SalonService = {
  id: string;
  name: string;
  image: string;
  price: number;
  duration: number;
  description: string;
};

const DEFAULT_IMAGE_MIME_TYPE = "image/jpeg";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80";

const DEFAULT_DESCRIPTION =
  "Our team will walk you through everything this service includes during your visit.";

const getImageSource = (image?: string | null) => {
  if (!image) return FALLBACK_IMAGE;

  const value = image.trim();

  if (!value) return FALLBACK_IMAGE;

  if (
    value.startsWith("data:image/") ||
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `data:${DEFAULT_IMAGE_MIME_TYPE};base64,${value}`;
};

const normalizeService = (item: any): SalonService => ({
  id: String(item.id),
  name: String(item.name ?? "Salon Service"),
  image: getImageSource(item.image),
  price: Number(item.price ?? 0),
  duration: Number(item.durationMinutes ?? 0),
  description: String(item.description ?? "").trim() || DEFAULT_DESCRIPTION,
});

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
  const [services, setServices] = useState<SalonService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedService, setSelectedService] = useState<SalonService | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await getSalonServiceItems();
        const rows = Array.isArray(response.data) ? response.data : [];

        setServices(
          rows
            .filter((item: any) => item.isActive !== false)
            .map(normalizeService),
        );
      } catch (error) {
        console.error("Unable to load salon services:", error);
        setErrorMessage(
          "We couldn't load our services right now. Please try again shortly.",
        );
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadServices();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -640 : 640,
      behavior: "smooth",
    });
  };

  const showScrollControls = !isLoading && !errorMessage && services.length > 0;

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
        {showScrollControls && (
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
        )}

        {/* =========================================
            SERVICES — HORIZONTAL SCROLL
        ========================================= */}
        {isLoading ? (
          <StateMessage
            icon={<Loader2 size={26} className="animate-spin" />}
            title="Loading our services..."
            description="Hang tight while we bring in the latest menu."
          />
        ) : errorMessage ? (
          <StateMessage
            icon={<AlertCircle size={26} />}
            title="Something went wrong"
            description={errorMessage}
          />
        ) : services.length === 0 ? (
          <StateMessage
            icon={<ImageOff size={26} />}
            title="No services available yet"
            description="Please check back soon — our menu is being updated."
          />
        ) : (
          <div
            ref={scrollRef}
            className="mt-4 flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide sm:gap-6"
          >
            {services.map((service) => (
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

                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-purple-600 shadow-sm">
                    <Sparkles size={16} />
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                    {service.name}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
                    {service.description}
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
            ))}
          </div>
        )}
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

function StateMessage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-purple-100 bg-white/70 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}

function ServiceDetailsModal({
  service,
  onClose,
}: {
  service: SalonService;
  onClose: () => void;
}) {
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
              <Sparkles size={18} />
            </span>
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

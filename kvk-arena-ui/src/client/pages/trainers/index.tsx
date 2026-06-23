import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye, Star } from "lucide-react";
import { getTrainers } from "@/services/trainers-api";
import TrainerLibraryModal from "@/components/trainers-list";

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  rating: number;
  isFreelance: boolean;
  profilePicture: string;
  email: string;
  phoneNumber: string;
  specialization?: string;
  yearsOfExperience?: number;
  approvalStatus?: number;
}

export default function Trainers() {

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrainerLibraryOpen, setIsTrainerLibraryOpen] = useState(false);

  const openTrainerModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsModalOpen(true);
  };

  const closeTrainerModal = () => {
    setSelectedTrainer(null);
    setIsModalOpen(false);
  };
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGetTrainers = async () => {
    try {
      const res = await getTrainers();
      setTrainers(res);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      setTrainers([]);
    }
  };

  useEffect(() => {
    handleGetTrainers();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -350 : 350,
      behavior: "smooth",
    });
  };
  const sortedTrainers = [...trainers].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  );

  const topTrainers = sortedTrainers.slice(0, 10);

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-white to-blue-50/40 overflow-hidden pt-15">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#296BE1]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#296BE1]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2
                data-aos="fade-up"
                data-aos-delay="100"
                className="text-3xl font-extrabold sm:text-4xl lg:text-5xl bg-linear-to-r from-black via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent"
              >
                Professional Trainers
              </h2>
              <button
                data-aos="fade-up"
                onClick={() => setIsTrainerLibraryOpen(true)}
                className="
                    py-3
                    rounded-xl
                    text-[#296BE1]
                    font-medium
                    cursor-pointer
                    transition-all
                    duration-300
                    hover:underline
                    flex items-center gap-2
                "
              >
                View More Trainers
              </button>
            </div>

            <div className="flex items-center justify-between" data-aos="fade-up" data-aos-delay="150">
              <p
                className="
                mt-4
                text-sm
                sm:text-base
                text-slate-500
                pr-0
                lg:pr-50
              "
              >
                Train alongside experienced fitness professionals dedicated to
                helping you build strength, improve performance, and achieve
                lasting results through expert guidance and personalized
                support.
              </p>
              {/* Arrows */}
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => scroll("left")}
                  className="w-12 h-12 cursor-pointer rounded-full backdrop-blur-xl bg-white/80 border border-white shadow-lg hover:bg-[#296BE1] hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={() => scroll("right")}
                  className="w-12 h-12 cursor-pointer rounded-full backdrop-blur-xl bg-white/80 border border-white shadow-lg hover:bg-[#296BE1] hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          data-aos="fade-up"
          className="
            flex
            gap-4
            sm:gap-6
            overflow-x-auto
            scrollbar-hide
            scroll-smooth
            pb-10
            pt-6
            snap-x
            snap-mandatory
            px-1
          "
        >
          {topTrainers.map((trainer) => (
            <div
              key={trainer.id}
              onClick={() => openTrainerModal(trainer)}
              className="group flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer"
            >
              <div
                className="
                 relative
                  bg-white/70
                  backdrop-blur-xl
                  rounded-3xl
                  overflow-hidden
                  border border-white
                  shadow-lg
                  hover:shadow-[0_20px_60px_rgba(41,107,225,0.18)]
                  hover:-translate-y-3
                  transition-all
                  duration-500
                  "
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  {trainer.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${trainer.profilePicture}`}
                      alt={`${trainer.firstName} ${trainer.lastName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#296BE1] to-blue-500">
                      <span className="text-5xl font-bold text-white">
                        {trainer.firstName?.charAt(0).toUpperCase()}
                        {trainer.lastName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* View More */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border border-white
                        px-6 py-3
                        text-sm font-medium
                        text-white
                        cursor-pointer

                        opacity-0
                        translate-y-6
                        pointer-events-none

                        transition-all duration-500

                        group-hover:opacity-100
                        group-hover:translate-y-0
                        group-hover:pointer-events-auto

                        hover:bg-white
                        hover:text-black
                        "
                    >
                      View More
                      <Eye size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-900 truncate">
                      {trainer.firstName} {trainer.lastName}
                    </h3>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                      <Star
                        size={14}
                        className="text-amber-500 fill-amber-500"
                      />
                      <span className="text-xs font-bold">
                        {trainer.rating ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#296BE1]">
                      {trainer.role}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${trainer.isFreelance
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-orange-50 text-orange-600"
                        }`}
                    >
                      {trainer.isFreelance ? "Freelance" : "Gym Trainer"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 truncate mb-5">
                    {trainer.email}
                  </p>
                  <p className="text-sm text-slate-500 truncate mb-5">
                    {trainer.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {/* View All Card */}
          <div className="group flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer">
            <div
              className="
                h-full min-h-[480px]
                rounded-3xl
                border-2 border-dashed border-[#296BE1]/30
                bg-gradient-to-br from-[#296BE1]/5 to-[#296BE1]/10
                flex flex-col items-center justify-center
                text-center
                p-8
                transition-all duration-500
                hover:-translate-y-3
                hover:border-[#296BE1]
                hover:shadow-[0_20px_60px_rgba(41,107,225,0.18)]
                "
            >
              <div className="w-20 h-20 rounded-full bg-[#296BE1] flex items-center justify-center mb-6">
                <Eye size={32} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                View All Trainers
              </h3>

              <p className="text-slate-500 text-sm mb-6">
                Explore our complete network of professional trainers and
                fitness experts.
              </p>

              <button
                className="
                    px-6 py-3
                    rounded-full
                    bg-[#296BE1]
                    text-white
                    font-medium
                    cursor-pointer
                    hover:bg-[#1f5dcc]
                    transition-all
                "
                onClick={() => setIsTrainerLibraryOpen(true)}
              >
                View More
              </button>
            </div>
          </div>
        </div>
      </div>

      <TrainerLibraryModal
        isOpen={isTrainerLibraryOpen}
        onClose={() => setIsTrainerLibraryOpen(false)}
        trainers={sortedTrainers}
        onSelectTrainer={(trainer) => {
          setSelectedTrainer(trainer);
          setIsModalOpen(true);
        }}
      />

      {isModalOpen && selectedTrainer && (
        <div
          className="fixed inset-0 z-5000000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeTrainerModal}
        >
          <div
            className="
            bg-white
            w-full
            max-w-3xl
            max-h-[95vh]
            overflow-y-auto
            rounded-2xl
            md:rounded-3xl
            shadow-2xl
          "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-36 sm:h-44 bg-gradient-to-r from-[#296BE1] to-blue-500">
              <button
                onClick={closeTrainerModal}
                className="
                  absolute
                  top-3
                  right-3
                  sm:top-4
                  sm:right-4
                  w-11
                  h-11
                  rounded-full
                  bg-white/20
                  text-white
                  hover:bg-white/30
                  transition
                  cursor-pointer
                  flex items-center justify-center
                "
              >
                ✕
              </button>

              <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0">
                {selectedTrainer.profilePicture ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedTrainer.profilePicture}`}
                    alt={`${selectedTrainer.firstName} ${selectedTrainer.lastName}`}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-slate-400">
                      {selectedTrainer.firstName?.charAt(0)}
                      {selectedTrainer.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 sm:pt-20 px-4 sm:px-8 pb-6 sm:pb-8">
              <div className="flex flex-col items-center text-center md:text-left md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {selectedTrainer.firstName} {selectedTrainer.lastName}
                  </h2>

                  <p className="text-[#296BE1] font-medium mt-1">
                    {selectedTrainer.role}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
                  <Star size={18} className="fill-amber-500 text-amber-500" />
                  <span className="font-semibold">
                    {selectedTrainer.rating ?? 0}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Email</p>
                  <p className="font-medium break-all">
                    {selectedTrainer.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Phone</p>
                  <p className="font-medium">{selectedTrainer.phoneNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Experience</p>
                  <p className="font-medium">
                    {selectedTrainer.yearsOfExperience ?? 0} Years
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Trainer Type</p>
                  <p className="font-medium">
                    {selectedTrainer.isFreelance
                      ? "Freelance Trainer"
                      : "Gym Trainer"}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Specializations</h3>

                <div className="flex flex-wrap gap-2">
                  {selectedTrainer.specialization
                    ?.split(",")
                    .map((item, index) => (
                      <span
                        key={index}
                        className="
  px-3
  py-2
  rounded-full
  bg-blue-50
  text-[#296BE1]
  text-xs
  sm:text-sm
  font-medium
"
                      >
                        {item.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

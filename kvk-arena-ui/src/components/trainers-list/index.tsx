import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Search, Eye, Star } from "lucide-react";

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

interface TrainerLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainers: Trainer[];
  onSelectTrainer?: (trainer: Trainer) => void;
}

export default function TrainerLibraryModal({
  isOpen,
  onClose,
  trainers,
  onSelectTrainer,
}: TrainerLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => setAnimate(true), 10);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setAnimate(false);
      setSearch("");
    }
  }, [isOpen]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
      return (
        fullName.includes(search.toLowerCase()) ||
        t.role.toLowerCase().includes(search.toLowerCase()) ||
        t.specialization?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [trainers, search]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999]">
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ${animate ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"
          }`}
      />

      {/* Modal */}
      <div
        className={`
          absolute
  inset-0
  md:inset-4
  bg-white
  rounded-none
  md:rounded-3xl
          overflow-hidden
          shadow-2xl
          flex flex-col
          transition-all duration-500
          ease-[cubic-bezier(0.16,1,0.3,1)]
          ${animate
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-[0.98]"
          }
        `}
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-4 sm:px-6 py-4 flex items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Trainers Library
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Browse all professional trainers
            </p>
          </div>

          <button
            onClick={onClose}
            className="
w-11 h-11
sm:w-10 sm:h-10
rounded-xl
cursor-pointer
bg-gray-100
hover:bg-gray-200
flex items-center justify-center
transition
"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainers..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="flex justify-between mb-4 text-sm text-gray-500">
            <p>{filteredTrainers.length} Trainers Found</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="
                  bg-white
                  rounded-3xl
                  border border-gray-100
                  overflow-hidden
                  shadow-sm
                  hover:shadow-xl
                  hover:-translate-y-1
                  transition-all
                  duration-300
                  cursor-pointer
                "
                onClick={() => onSelectTrainer?.(trainer)}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden relative group">
                  {trainer.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${trainer.profilePicture}`}
                      alt={`${trainer.firstName} ${trainer.lastName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-400">
                        {trainer.firstName?.charAt(0)}
                        {trainer.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
                      <Eye size={16} />
                      View
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                      {trainer.firstName} {trainer.lastName}
                    </h3>

                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-semibold">
                        {trainer.rating ?? 0}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {trainer.role}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {trainer.specialization
                      ?.split(",")
                      .slice(0, 2)
                      .map((s, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600"
                        >
                          {s.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredTrainers.length === 0 && (
            <div className="text-center py-12 sm:py-20 text-gray-400">
              No trainers found
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
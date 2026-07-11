import IMG from "@/assets/road.png";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ConstructionModalProps {
  open: boolean;
  onClose: () => void;
  pageName: string;
}

export default function ConstructionModal({
  open,
  onClose,
  pageName,
}: ConstructionModalProps) {
  if (!open) return null;

  return (
    createPortal(
  <div className="fixed inset-0 z-50000 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
    <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 duration-300">

      {/* Gradient Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 px-6 pt-8 pb-3">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-500 shadow transition-all hover:rotate-90 hover:bg-red-50 hover:text-red-500"
        >
          <X size={20} />
        </button>

        {/* Image */}
        <img
          src={IMG}
          alt="Coming Soon"
          className="mx-auto w-40 sm:w-52 md:w-60"
        />
      </div>

      {/* Content */}
      <div className="px-6 pb-8 pt-4 text-center sm:px-8">

        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl py-2">
          Coming Soon 🚧
        </h2>

        <div className="mt-3 inline-flex rounded-full bg-blue-100 px-4 py-1">
          <span className="text-sm font-semibold text-blue-700 sm:text-base">
            {pageName}
          </span>
        </div>

        <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-gray-500 sm:text-base">
          We're working hard to bring this feature to life.

          <span className="mt-3 block font-medium text-gray-700">
            <strong>{pageName}</strong> is currently under construction and
            will be available very soon.
          </span>
        </p>
      </div>
    </div>
  </div>,
    document.body
    )
);
}
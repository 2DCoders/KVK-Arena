import { LoaderCircle } from "lucide-react";

interface GymDataStateProps {
  loading: boolean;
  error: boolean;
  label: string;
  onRetry: () => void;
  dark?: boolean;
  cards?: "trainers" | "plans";
}

export default function GymDataState({ loading, error, label, onRetry, dark = false, cards }: GymDataStateProps) {
  const surface = dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white";
  const placeholder = dark ? "bg-white/10" : "bg-slate-200";

  return (
    <div className={`w-full py-6 ${dark ? "text-slate-300" : "text-slate-500"}`} aria-busy={loading}>
      <div role={error ? "alert" : "status"} className="flex flex-wrap items-center justify-center gap-3 text-sm">
        {loading && <LoaderCircle aria-hidden="true" className="h-5 w-5 text-blue-500 motion-safe:animate-spin" />}
        <span>{loading ? `Loading ${label}...` : error ? `We couldn't load ${label}. Please try again.` : `No ${label} available right now.`}</span>
        {error && !loading && (
          <button type="button" onClick={onRetry} className="cursor-pointer rounded-lg bg-[#296BE1] px-4 py-2 font-semibold text-white hover:bg-[#1f58be]">
            Try again
          </button>
        )}
      </div>
      {loading && cards && (
        <div aria-hidden="true" className="mt-6 flex gap-4 overflow-hidden pb-6 sm:gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={`shrink-0 overflow-hidden rounded-3xl border motion-safe:animate-pulse ${surface} ${cards === "trainers" ? "w-[260px] sm:w-[280px]" : "w-[280px] sm:w-[360px]"}`}>
              {cards === "trainers" && <div className={`aspect-square ${placeholder}`} />}
              <div className="space-y-5 p-6">
                <div className={`h-7 w-2/3 rounded-lg ${placeholder}`} />
                <div className={`h-4 w-1/2 rounded-lg ${placeholder}`} />
                <div className={`h-4 w-full rounded-lg ${placeholder}`} />
                <div className={`h-4 w-3/4 rounded-lg ${placeholder}`} />
                {cards === "plans" && <>
                  <div className={`h-12 w-full rounded-lg ${placeholder}`} />
                  <div className={`h-4 w-5/6 rounded-lg ${placeholder}`} />
                  <div className={`h-4 w-2/3 rounded-lg ${placeholder}`} />
                  <div className={`h-4 w-3/4 rounded-lg ${placeholder}`} />
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

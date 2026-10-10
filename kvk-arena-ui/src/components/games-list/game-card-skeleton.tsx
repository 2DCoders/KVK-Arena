export default function GameCardSkeleton({ library = false }: { library?: boolean }) {
  return (
    <div aria-hidden="true" className={`overflow-hidden border border-slate-200 bg-white shadow-sm motion-safe:animate-pulse ${library ? "rounded-3xl" : "w-[180px] shrink-0 rounded-2xl sm:w-[280px] sm:rounded-3xl"}`}>
      <div className={library ? "p-3 pb-0" : "p-2 pb-0 sm:p-3"}>
        <div className={`rounded-xl bg-slate-200 ${library ? "h-40 rounded-2xl" : "aspect-[3/2] sm:rounded-[18px]"}`} />
      </div>
      <div className={library ? "space-y-3 p-4" : "space-y-3 p-3 sm:p-5"}>
        <div className="h-5 w-4/5 rounded bg-slate-200" />
        <div className="space-y-2"><div className="h-3 w-full rounded bg-slate-100" /><div className="h-3 w-3/4 rounded bg-slate-100" /></div>
        <div className="h-6 w-16 rounded-full bg-slate-100" />
        {!library && <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:pt-4"><div className="h-8 w-16 rounded bg-slate-100" /><div className="h-8 w-8 rounded-full bg-slate-100" /></div>}
      </div>
    </div>
  );
}

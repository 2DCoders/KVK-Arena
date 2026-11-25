import { Clock3 } from "lucide-react";

const formatPrice = (price: number) =>
  `LKR ${Number(price).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function OpeningPromotionNotice() {
  return (
    <p className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-linear-to-r from-amber-200 via-amber-300 to-orange-200 px-3 py-2.5 text-center text-sm font-extrabold leading-snug text-amber-950 shadow-sm">
      <Clock3 aria-hidden="true" className="size-4 shrink-0" />
      <span>Opening promotion only for a week</span>
    </p>
  );
}

export default function GymPlanPrice({ price, discountedPrice }: {
  price: number;
  discountedPrice?: number;
}) {
  if (discountedPrice == null) return <>{formatPrice(price)}</>;

  return (
    <span className="inline-flex flex-col gap-2.5">
      <span className="flex flex-col gap-1 font-medium opacity-80">
        <span className="text-xs leading-tight tracking-normal">Original price</span>
        <del className="text-sm leading-tight tracking-normal">{formatPrice(price)}</del>
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-xs font-medium leading-tight tracking-normal opacity-80">Discounted price</span>
        {formatPrice(discountedPrice)}
      </span>
    </span>
  );
}

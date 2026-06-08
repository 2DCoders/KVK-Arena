import hero_bg from "@/assets/hero/gaming_hero1.png";
import { Badge } from "lucide-react";

export default function GamingHero() {
  return (
    <section className="relative isolate overflow-hidden min-h-[85vh] flex items-center py-25">
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hero_bg})` }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

    </section>
  );
}
import ComingSoon from "../shared";
import logo from "@/assets/badminton_logo.png";
import type { LucideProps } from "lucide-react";

function Shuttlecock(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 16 3 4l4 1 3-3 3 3 4-1-4 12M7 16h6M7 16a3 3 0 0 0 6 0M7 5l2 11M13 5l-2 11M3 4l14 0" />
    </svg>
  );
}

export default function BadmintonComingSoon() {
  return <ComingSoon name="KVK Badminton" logo={logo} hue={27} eyebrow="YOUR NEXT GAME AWAITS" icon={Shuttlecock} />;
}

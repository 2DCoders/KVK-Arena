import ComingSoon from "../shared";
import logo from "@/assets/cafe-logo.png";
import { Coffee } from "lucide-react";

export default function CafeComingSoon() {
  return <ComingSoon name="KVK Cafe" logo={logo} hue={35} eyebrow="SOMETHING GOOD IS BREWING" icon={Coffee} />;
}


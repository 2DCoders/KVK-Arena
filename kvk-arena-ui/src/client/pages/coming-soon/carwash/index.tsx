import ComingSoon from "../shared";
import logo from "@/assets/carwash_logo.png";
import { CarFront } from "lucide-react";

export default function CarwashComingSoon() {
  return <ComingSoon name="KVK Car Wash" logo={logo} hue={210} eyebrow="A NEW LEVEL OF SHINE" icon={CarFront} />;
}

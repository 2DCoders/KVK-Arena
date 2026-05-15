import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiHome,
  FiKey,
  FiLock,
  FiMapPin,
  FiMonitor,
  FiMusic,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTool,
  FiTruck,
  FiUsers,
  FiZap,
} from "react-icons/fi";

export type NavItem = {
  label: string;
  href: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: IconType;
};

export type Stat = {
  value: string;
  label: string;
};

export type PageContent = {
  eyebrow: string;
  title: string;
  description: string;
  summaryTitle: string;
  summaryText: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  stats: Stat[];
  features: Feature[];
  highlightsTitle: string;
  highlights: string[];
  panelTitle: string;
  panelText: string;
  theme: {
    accent: string;
    orb: string;
    panel: string;
    chip: string;
    border: string;
  };
};

export const publicNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Gym", href: "/kvk-gym" },
  { label: "Car Wash", href: "/kvk-car-wash" },
  { label: "Badminton", href: "/kvk-badminton" },
  { label: "Gaming", href: "/kvk-gaming" },
  { label: "Clothing", href: "/kvk-clothing" },
  { label: "Admin Login", href: "/kvk-admin-login" },
];

export const pageContent: Record<string, PageContent> = {
  home: {
    eyebrow: "KVK Arena",
    title: "Five services. One branded experience.",
    description:
      "A single web presence for the arena, gym, wash bay, court booking, gaming zone, and clothing line so customers can quickly discover everything KVK offers.",
    summaryTitle: "What the website needs to do first",
    summaryText:
      "Guide visitors to the right service, keep the look consistent, and give the admin team a clear route into the back office later.",
    primaryCta: {
      label: "Explore the gym",
      href: "/kvk-gym",
    },
    secondaryCta: {
      label: "Admin login",
      href: "/kvk-admin-login",
    },
    stats: [
      { value: "5", label: "customer-facing services" },
      { value: "1", label: "shared brand system" },
      { value: "Soon", label: "admin expansion ready" },
    ],
    features: [
      {
        title: "Gym",
        description:
          "Memberships, equipment, coaching, and daily training journeys in one place.",
        icon: FiActivity,
      },
      {
        title: "Car Wash",
        description:
          "Fast booking and clean service presentation for interior and exterior care.",
        icon: FiDroplet,
      },
      {
        title: "Badminton",
        description:
          "Court discovery, slots, and event-ready booking flow for players.",
        icon: FiAward,
      },
      {
        title: "Gaming",
        description:
          "Console play, team sessions, and entertainment zones for casual or competitive visits.",
        icon: FiMonitor,
      },
      {
        title: "Clothing",
        description:
          "Teamwear, branded merch, and casual apparel for the KVK audience.",
        icon: FiShoppingBag,
      },
      {
        title: "Admin",
        description:
          "A separate login route now, with room for protected management pages later.",
        icon: FiLock,
      },
    ],
    highlightsTitle: "Why this route structure works",
    highlights: [
      "Each service gets its own discoverable landing page without duplicating the whole app shell.",
      "The admin login stays isolated so protected routes can be added later without breaking public URLs.",
      "Navigation stays simple now, while the design system can scale into bookings, billing, and reports.",
    ],
    panelTitle: "Built to grow into bookings and operations",
    panelText:
      "The first implementation is intentionally static. It establishes the layout and routes now, then leaves room for forms, APIs, dashboards, and auth flow once the content direction is approved.",
    theme: {
      accent: "from-cyan-300 via-sky-400 to-blue-500",
      orb: "bg-cyan-300/25",
      panel: "bg-white/8",
      chip: "bg-cyan-300/12 text-cyan-100 ring-1 ring-cyan-200/20",
      border: "border-white/12",
    },
  },
  gym: {
    eyebrow: "KVK Gym",
    title: "Train harder in a space built for momentum.",
    description:
      "Showcase equipment, membership value, and training confidence with a page that feels like a premium fitness destination.",
    summaryTitle: "Gym page focus",
    summaryText:
      "This page should help new and returning members understand the value of the gym, the atmosphere, and how to take the next step.",
    primaryCta: {
      label: "Request a visit",
      href: "/kvk-admin-login",
    },
    secondaryCta: {
      label: "Back to home",
      href: "/",
    },
    stats: [
      { value: "Strength", label: "training zone" },
      { value: "Coaching", label: "support ready" },
      { value: "Hygiene", label: "first-class care" },
    ],
    features: [
      {
        title: "Modern equipment",
        description:
          "Present the gym floor, free weights, and machine selection with confidence.",
        icon: FiActivity,
      },
      {
        title: "Coaching support",
        description:
          "Highlight personal guidance, beginner support, and progress-focused sessions.",
        icon: FiUsers,
      },
      {
        title: "Clean routines",
        description:
          "Reassure visitors with a polished, disciplined environment for daily workouts.",
        icon: FiShield,
      },
    ],
    highlightsTitle: "Key gym messaging",
    highlights: [
      "Easy-to-scan membership and membership-benefit messaging.",
      "Clear visual hierarchy for equipment, coaching, and operating hours.",
      "A strong CTA that can later connect to booking or lead capture.",
    ],
    panelTitle: "Make the first impression feel premium",
    panelText:
      "Use this route to sell confidence, consistency, and coaching support before the booking flow is wired in.",
    theme: {
      accent: "from-emerald-300 via-teal-400 to-cyan-500",
      orb: "bg-emerald-300/20",
      panel: "bg-emerald-400/8",
      chip: "bg-emerald-300/12 text-emerald-100 ring-1 ring-emerald-200/20",
      border: "border-emerald-200/16",
    },
  },
  "car-wash": {
    eyebrow: "KVK Car Wash",
    title: "Fast, polished car care that feels premium.",
    description:
      "The car wash page should sell speed, cleanliness, and trust with a straightforward route for visitors who want a quick turnaround.",
    summaryTitle: "Car wash page focus",
    summaryText:
      "Lead with service quality, quick turnaround, and a tidy experience that makes a simple task feel effortless.",
    primaryCta: {
      label: "Book a wash",
      href: "/kvk-admin-login",
    },
    secondaryCta: {
      label: "See gaming zone",
      href: "/kvk-gaming",
    },
    stats: [
      { value: "Quick", label: "turnaround" },
      { value: "Interior", label: "and exterior care" },
      { value: "Trusted", label: "presentation" },
    ],
    features: [
      {
        title: "Exterior clean",
        description:
          "Showcase a bright, fresh finish with a service card that feels efficient and reliable.",
        icon: FiDroplet,
      },
      {
        title: "Interior refresh",
        description:
          "Highlight vacuuming, dust removal, and clean cabin details for daily drivers.",
        icon: FiTool,
      },
      {
        title: "Fast service flow",
        description:
          "Make the action path obvious so customers know how to arrive, wait, and leave quickly.",
        icon: FiClock,
      },
    ],
    highlightsTitle: "Key car wash messaging",
    highlights: [
      "Emphasize speed without making the experience feel rushed.",
      "Use a polished, clean visual language to match the service.",
      "Keep the route ready for future booking forms or WhatsApp links.",
    ],
    panelTitle: "Simple, direct, and easy to trust",
    panelText:
      "The page should make it obvious that the service is quick, neat, and dependable, even before the booking workflow is connected.",
    theme: {
      accent: "from-sky-300 via-cyan-400 to-blue-500",
      orb: "bg-sky-300/18",
      panel: "bg-sky-400/8",
      chip: "bg-sky-300/12 text-sky-100 ring-1 ring-sky-200/20",
      border: "border-sky-200/16",
    },
  },
  badminton: {
    eyebrow: "KVK Badminton",
    title: "Court booking that feels active and competitive.",
    description:
      "Build a page around court availability, match nights, and friendly competition so players can picture themselves on the court.",
    summaryTitle: "Badminton page focus",
    summaryText:
      "The route should sell the atmosphere of play, court quality, and a clear path to reserve time.",
    primaryCta: {
      label: "Reserve a slot",
      href: "/kvk-admin-login",
    },
    secondaryCta: {
      label: "See clothing",
      href: "/kvk-clothing",
    },
    stats: [
      { value: "Court", label: "discoverability" },
      { value: "Matches", label: "and events" },
      { value: "Fast", label: "booking path" },
    ],
    features: [
      {
        title: "Court visibility",
        description:
          "Present court availability, surface quality, and playing conditions with clarity.",
        icon: FiMapPin,
      },
      {
        title: "Competitive energy",
        description:
          "Use sharp visuals and action-oriented copy that feels energetic and social.",
        icon: FiZap,
      },
      {
        title: "Player-friendly flow",
        description:
          "Keep booking, timing, and visit details easy to understand at a glance.",
        icon: FiUsers,
      },
    ],
    highlightsTitle: "Key badminton messaging",
    highlights: [
      "Highlight court experience, not just the booking mechanics.",
      "Keep the page energetic and easy to scan for players on mobile.",
      "Reserve room for future league, tournament, or membership content.",
    ],
    panelTitle: "Designed for quick decision-making",
    panelText:
      "Visitors should be able to understand the playing opportunity and take action without scrolling through dense content.",
    theme: {
      accent: "from-amber-300 via-orange-400 to-rose-500",
      orb: "bg-amber-300/20",
      panel: "bg-amber-400/8",
      chip: "bg-amber-300/12 text-amber-100 ring-1 ring-amber-200/20",
      border: "border-amber-200/16",
    },
  },
  gaming: {
    eyebrow: "KVK Gaming",
    title: "A social play zone with a strong digital edge.",
    description:
      "Position the gaming area as a place for console sessions, group play, and event nights with a high-energy presentation.",
    summaryTitle: "Gaming page focus",
    summaryText:
      "This route should feel lively, communal, and easy to convert into a visit or event inquiry.",
    primaryCta: {
      label: "Plan a session",
      href: "/kvk-admin-login",
    },
    secondaryCta: {
      label: "Back to home",
      href: "/",
    },
    stats: [
      { value: "Console", label: "play sessions" },
      { value: "Events", label: "and meetups" },
      { value: "Group", label: "friendly flow" },
    ],
    features: [
      {
        title: "Console play",
        description:
          "Show a modern gaming space that feels ready for solo or team sessions.",
        icon: FiMonitor,
      },
      {
        title: "Event nights",
        description:
          "Support tournaments, birthday bookings, and casual competition in one destination.",
        icon: FiMusic,
      },
      {
        title: "Social energy",
        description:
          "Lean into a vibrant, welcoming atmosphere for friends and recurring visitors.",
        icon: FiUsers,
      },
    ],
    highlightsTitle: "Key gaming messaging",
    highlights: [
      "Use bright contrast and motion-friendly composition.",
      "Keep the page playful but still polished enough for the brand.",
      "Leave space for event calendars, pricing, or package details later.",
    ],
    panelTitle: "Entertainment with structure",
    panelText:
      "The page should communicate fun and flexibility while keeping the route ready for future scheduling features.",
    theme: {
      accent: "from-fuchsia-300 via-violet-400 to-indigo-500",
      orb: "bg-fuchsia-300/20",
      panel: "bg-fuchsia-400/8",
      chip: "bg-fuchsia-300/12 text-fuchsia-100 ring-1 ring-fuchsia-200/20",
      border: "border-fuchsia-200/16",
    },
  },
  clothing: {
    eyebrow: "KVK Clothing",
    title: "Brand merchandise that extends the arena identity.",
    description:
      "Create a page for apparel, uniforms, and merchandise that feels like part of the same ecosystem as the other services.",
    summaryTitle: "Clothing page focus",
    summaryText:
      "Use this page to present branded apparel and teamwear with a clean retail layout.",
    primaryCta: {
      label: "Browse apparel",
      href: "/kvk-admin-login",
    },
    secondaryCta: {
      label: "See badminton",
      href: "/kvk-badminton",
    },
    stats: [
      { value: "Teamwear", label: "and merch" },
      { value: "Brand", label: "continuity" },
      { value: "Retail", label: "ready layout" },
    ],
    features: [
      {
        title: "Branded apparel",
        description:
          "Present shirts, hoodies, and event wear with a consistent KVK identity.",
        icon: FiShoppingBag,
      },
      {
        title: "Team and event gear",
        description:
          "Position the clothing line as a natural extension of the arena community.",
        icon: FiAward,
      },
      {
        title: "Easy selection",
        description:
          "Keep the retail journey simple so products can be browsed quickly on mobile.",
        icon: FiCheckCircle,
      },
    ],
    highlightsTitle: "Key clothing messaging",
    highlights: [
      "Keep the retail page visually aligned with the rest of the brand.",
      "Prepare the page for products, sizes, and catalog navigation later.",
      "Use the same navigation so the clothing line feels part of KVK Arena.",
    ],
    panelTitle: "Retail without breaking the brand",
    panelText:
      "This route should make the clothing line feel intentional, professional, and connected to the wider KVK experience.",
    theme: {
      accent: "from-rose-300 via-pink-400 to-orange-400",
      orb: "bg-rose-300/20",
      panel: "bg-rose-400/8",
      chip: "bg-rose-300/12 text-rose-100 ring-1 ring-rose-200/20",
      border: "border-rose-200/16",
    },
  },
};

export const adminLoginTheme = {
  accent: "from-slate-200 via-cyan-200 to-sky-300",
  orb: "bg-sky-300/20",
  panel: "bg-white/7",
  chip: "bg-white/10 text-white ring-1 ring-white/10",
  border: "border-white/10",
};

export const adminLoginBenefits = [
  {
    title: "Secure access",
    description: "Keep the admin entry point isolated from the public pages.",
    icon: FiLock,
  },
  {
    title: "Future-ready routing",
    description: "Add dashboards, booking tools, and reports without renaming this URL.",
    icon: FiKey,
  },
  {
    title: "Operations-focused",
    description: "Keep the login screen simple so staff can move toward work quickly.",
    icon: FiPhone,
  },
];

export const iconByService = {
  home: FiHome,
  gym: FiActivity,
  carWash: FiTruck,
  badminton: FiAward,
  gaming: FiMonitor,
  clothing: FiShoppingBag,
  admin: FiLock,
  clock: FiClock,
  shield: FiShield,
  star: FiStar,
};
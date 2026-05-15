"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-20 bg-transparent">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden md:inline-flex items-center gap-3 text-sm font-medium text-white/90">
            Home
          </Link>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5"
            >
              Services
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9l6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div className="absolute left-0 mt-2 w-48 rounded-lg border border-white/8 bg-white/6 p-2 shadow-lg">
                <Link href="/kvk-gym" className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/5">Gym</Link>
                <Link href="/kvk-car-wash" className="mt-1 block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/5">Car Wash</Link>
                <Link href="/kvk-badminton" className="mt-1 block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/5">Badminton</Link>
                <Link href="/kvk-gaming" className="mt-1 block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/5">Gaming</Link>
                <Link href="/kvk-clothing" className="mt-1 block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/5">Clothing</Link>
              </div>
            )}
          </div>

          <Link href="/about" className="hidden md:inline-flex items-center gap-3 text-sm font-medium text-white/80">
            About
          </Link>

          <Link href="/contact" className="hidden md:inline-flex items-center gap-3 text-sm font-medium text-white/80">
            Contact
          </Link>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="pointer-events-auto inline-flex items-center gap-3">
            <Image src="/assets/logo.svg" alt="KVK" width={140} height={40} priority />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/kvk-admin-login"
            className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

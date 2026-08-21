"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "AI Workflow", href: "#ai-workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 rounded-full border transition-all duration-300 ${
        scrolled
          ? "border-white/20 bg-[#0a0f1e]/55 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "border-white/10 bg-white/[0.06] shadow-lg shadow-black/5 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
            <Sparkles className="h-4 w-4" />
          </div>
          SmileOS
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-white/70 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-3xl border border-white/10 bg-[#0a0f1e]/55 px-4 py-4 space-y-3 backdrop-blur-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-white/60 hover:text-white py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
            <Link href="/login" className="text-sm text-white/70 hover:text-white py-2 text-center" onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
            <Link href="/signup" className="text-sm bg-primary text-primary-foreground py-2.5 rounded-lg text-center font-medium" onClick={() => setMobileOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "API", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Partners", href: "#" },
  ],
  Resources: [
    { label: "Help Center", href: "#" },
    { label: "Guides", href: "#" },
    { label: "Community", href: "#" },
    { label: "Status", href: "#" },
    { label: "Security", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "HIPAA Compliance", href: "#" },
    { label: "SOC 2", href: "#" },
    { label: "DPA", href: "#" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-[#0a0f1e] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start building the future of dental care.
          </h2>
          <p className="mt-4 text-white/50 max-w-lg mx-auto">
            Join hundreds of dental practices using SmileOS to deliver exceptional patient experiences.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="bg-white text-[#0a0f1e] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="border border-white/20 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              Book a Demo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 py-12 border-t border-white/10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              SmileOS
            </Link>
            <p className="text-sm text-white/40 max-w-xs">
              The operating system for modern dental practices.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} SmileOS. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            HIPAA Compliant · SOC 2 · 256-bit Encryption
          </p>
        </div>
      </div>
    </footer>
  );
}

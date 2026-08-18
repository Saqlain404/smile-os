import Link from "next/link";
import {
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  Sparkles,
  Check,
  ArrowRight,
  Star,
  Stethoscope,
  Clock,
  Smartphone,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

const features = [
  {
    icon: Users,
    title: "Patient CRM",
    description:
      "Complete patient profiles with medical history, insurance, family links, and communication preferences.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Drag-and-drop calendar with chair management, doctor availability, and conflict detection.",
  },
  {
    icon: CreditCard,
    title: "Billing & Invoicing",
    description:
      "Create invoices, record payments, track insurance claims, and manage treatment packages.",
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description:
      "Email, SMS, and WhatsApp reminders for appointments, follow-ups, and payment due dates.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Revenue tracking, appointment stats, patient demographics, and staff performance dashboards.",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description:
      "Enterprise-grade security with role-based access control, audit logs, and encrypted data.",
  },
];

const steps = [
  {
    step: "01",
    title: "Set up your clinic",
    description: "Add your team, treatments, chairs, and working hours in minutes.",
    icon: Stethoscope,
  },
  {
    step: "02",
    title: "Manage patients",
    description: "Import existing records or add patients as they walk in. Everything in one place.",
    icon: Users,
  },
  {
    step: "03",
    title: "Grow your practice",
    description: "Automated reminders reduce no-shows. Analytics help you make smarter decisions.",
    icon: BarChart3,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    description: "For solo practitioners",
    price: 49,
    period: "month",
    features: [
      "1 dentist",
      "Up to 500 patients",
      "Appointment scheduling",
      "Basic invoicing",
      "Email reminders",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing practices",
    price: 99,
    period: "month",
    features: [
      "Up to 5 dentists",
      "Unlimited patients",
      "Full billing & payments",
      "SMS & WhatsApp reminders",
      "Analytics dashboard",
      "Multi-chair management",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For dental groups",
    price: null,
    period: "",
    features: [
      "Unlimited dentists",
      "Multi-location",
      "Custom integrations",
      "Advanced analytics",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Owner, Bright Smile Dental",
    content:
      "SmileOS transformed our practice. We reduced no-shows by 40% with automated reminders and our billing time cut in half.",
    rating: 5,
  },
  {
    name: "Dr. James Park",
    role: "Partner, Park & Associates",
    content:
      "Finally, a dental software that doesn't feel like it was built in 2005. Clean, fast, and our staff actually enjoys using it.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Office Manager, Happy Teeth Clinic",
    content:
      "The patient check-in flow is seamless. We went from 15 minutes of paperwork to a 2-minute digital process.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />

      <main className="flex-1">
        {/* ─── Hero ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Built for modern dental practices
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                The operating system for{" "}
                <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                  dental practices
                </span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Manage patients, schedule appointments, handle billing, and grow your practice — all from one beautiful dashboard.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "default", size: "lg" }) + " gap-2 px-6"}
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className={buttonVariants({ variant: "outline", size: "lg" }) + " px-6"}
                >
                  See how it works
                </a>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                No credit card required &middot; 14-day free trial &middot; Cancel anytime
              </p>
            </div>

            {/* App preview mockup */}
            <div className="mt-16 mx-auto max-w-4xl">
              <div className="rounded-xl border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Mockup topbar */}
                <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-8">
                    <div className="mx-auto h-6 w-64 rounded-md bg-muted" />
                  </div>
                </div>
                {/* Mockup content */}
                <div className="grid grid-cols-5 h-72">
                  {/* Sidebar */}
                  <div className="col-span-1 border-r bg-muted/20 p-3 space-y-2 hidden sm:block">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-7 rounded-md bg-muted/50" />
                    ))}
                  </div>
                  {/* Main content */}
                  <div className="col-span-5 sm:col-span-4 p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-lg bg-muted/40 p-3">
                          <div className="h-3 w-16 rounded bg-muted/60 mb-2" />
                          <div className="h-5 w-12 rounded bg-primary/20" />
                        </div>
                      ))}
                    </div>
                    <div className="h-36 rounded-lg bg-muted/30 p-4">
                      <div className="h-3 w-24 rounded bg-muted/60 mb-3" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-5 rounded bg-muted/40" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Logos ───────────────────────────────────────────── */}
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
            <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
              Trusted by dental practices worldwide
            </p>
            <div className="flex items-center justify-center gap-8 sm:gap-16 opacity-40">
              {["Bright Smile", "Happy Teeth", "Park Dental", "Smile Studio", "Pearl Clinic"].map(
                (name) => (
                  <div key={name} className="text-sm sm:text-base font-bold text-foreground/60 whitespace-nowrap">
                    {name}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* ─── Features ────────────────────────────────────────── */}
        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="mt-3 text-muted-foreground">
                A complete platform designed specifically for dental practices. Replace spreadsheets, paper charts, and clunky legacy software.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Up and running in minutes
              </h2>
              <p className="mt-3 text-muted-foreground">
                No complex setup, no training manuals. SmileOS is designed to be intuitive from day one.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold mb-5">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing ─────────────────────────────────────────── */}
        <section id="pricing" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-muted-foreground">
                No hidden fees, no per-transaction charges. Pick a plan that fits your practice.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 max-w-4xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    plan.highlighted
                      ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                      : "bg-card"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-sm text-muted-foreground">/{plan.period}</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold">Custom</div>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={buttonVariants({
                      variant: plan.highlighted ? "default" : "outline",
                      size: "sm",
                    }) + " w-full justify-center"}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ────────────────────────────────────── */}
        <section id="testimonials" className="py-20 sm:py-28 bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Loved by dental teams
              </h2>
              <p className="mt-3 text-muted-foreground">
                See what dental professionals are saying about SmileOS.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border bg-card p-6 flex flex-col"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ───────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative rounded-3xl bg-primary px-6 py-16 sm:px-16 text-center overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight">
                  Ready to modernize your practice?
                </h2>
                <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
                  Join hundreds of dental practices already using SmileOS. Start your free trial today — no credit card required.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "lg",
                    }) + " gap-2 px-6"}
                  >
                    Start free trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

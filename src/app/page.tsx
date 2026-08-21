import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Hero } from "@/components/marketing/hero";
import { AiWorkflow } from "@/components/marketing/ai-workflow";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { DashboardShowcase } from "@/components/marketing/dashboard-showcase";
import { BentoGrid } from "@/components/marketing/bento-grid";
import { Stats } from "@/components/marketing/stats";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingNav />

      <main className="flex-1">
        <Hero />

        <div id="features">
          <BentoGrid />
        </div>

        <FeatureShowcase />

        <DashboardShowcase />

        <div id="ai-workflow">
          <AiWorkflow />
        </div>

        <Stats />

        <div id="testimonials">
          <Testimonials />
        </div>

        <div id="pricing">
          <Pricing />
        </div>

        <FAQ />

        <FinalCTA />
      </main>

      <MarketingFooter />
    </div>
  );
}

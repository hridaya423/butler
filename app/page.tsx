'use client';

import { HeroSection } from "@/components/landing/hero-section";
import { ValueProp } from "@/components/landing/value-prop";
import { FeatureUnified } from "@/components/landing/feature-unified";
import { FeatureCuration } from "@/components/landing/feature-curation";
import { FeatureAutomation } from "@/components/landing/feature-automation";
import { InfiniteMarquee } from "@/components/landing/infinite-marquee";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white selection:bg-neutral-100 selection:text-black overflow-x-hidden">
      <HeroSection />

      <ValueProp />

      <FeatureUnified />

      <FeatureCuration />

      <FeatureAutomation />

      <InfiniteMarquee />

      <FinalCTA />

      <Footer />
    </main>
  );
}

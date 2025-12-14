import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import LiveDemo from "@/components/landing/LiveDemo";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import UseCases from "@/components/landing/UseCases";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <LiveDemo />
        <Features />
        <Pricing />
        <UseCases />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

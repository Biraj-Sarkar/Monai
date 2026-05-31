import HeroSection from "../home/HeroSection";
import FeaturesSection from "../home/FeaturesSection";
import FinanceSection from "../home/FinanceSection";
import StepsSection from "../home/StepsSection";
import TestimonialsSection from "../home/TestimonialsSection";
import CTASection from "../home/CTASection";

export default function Home() {
  return (
    <main className="mx-auto w-[min(1180px,calc(100%-1rem))] px-0 pb-20 pt-5 sm:w-[min(1180px,calc(100%-2rem))]">
      <HeroSection />
      <FeaturesSection />
      <FinanceSection />
      <StepsSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
};
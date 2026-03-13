"use client";

import { useRef, useState } from "react";
import Hero from "@/components/Hero";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import Navbar from "@/components/navbar";
import { ProductsSection } from "@/components/ProductsSection";
import { InfrastructureSection } from "@/components/InfrastructureSection";
import { CodeSection } from "@/components/CodeSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { WaitlistModal } from "@/components/WaitlistModal";

import { ConnectivitySection } from "@/components/ConnectivitySection";
import { Simulator } from "@/components/Simulator";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import { TerminalPreview } from "@/components/TerminalPreview";
import { CustomCursor } from "@/components/CustomCursor";
import { SoundSystem } from "@/components/SoundSystem";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, MotionPathPlugin);

export default function Home() {
  const main = useRef<HTMLDivElement>(null);
  const smoother = useRef<ScrollSmoother | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  useGSAP(
    () => {
      smoother.current = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        
        content: "#smooth-content",
        smooth: 2,
        effects: true,
      });

      // ScrollTrigger.create({
      //   trigger: "#smooth-content",
      //   start: "top top",
      //   end: "+=500",
      //   pin: true,
      //   scrub: true,
      //   onEnter: () => {
      //     gsap.from("#smooth-content", {
      //       opacity: 0,
      //       y: 40,
      //       duration: 0.8,
      //       ease: "power2.out",
      //     });
      //   },
      //   markers: true
      // });
    },
    { scope: main }
  );

  return (
    <>
      <CustomCursor />
      <SoundSystem />
      <Navbar />
      <div id="smooth-wrapper" ref={main}>
        <div id="smooth-content" className="pt-20">
          <div data-speed="1.1">
            <Hero onWaitlistClick={() => setIsWaitlistOpen(true)} />
          </div>
          <div data-speed="0.95">
            <ProductsSection />
          </div>
          <div data-speed="1.2">
             <InfrastructureSection />
          </div>
          <div data-speed="1.1">
             <ConnectivitySection />
          </div>
          <div data-speed="1.0">
            <Simulator />
          </div>
          <div data-speed="1.15">
            <CodeSection />
          </div>
          <div data-speed="0.9">
            <PricingSection onWaitlistClick={() => setIsWaitlistOpen(true)} />
          </div>
          <div data-speed="1.1">
            <TerminalPreview />
          </div>
          <Footer onWaitlistClick={() => setIsWaitlistOpen(true)} />
        </div>
      </div>
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </>
  );
}

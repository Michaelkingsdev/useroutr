"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Play, ArrowRight, Activity } from "lucide-react";
import { Button } from "./ui/button";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

interface HeroProps {
  onWaitlistClick: () => void;
}

const Hero = ({ onWaitlistClick }: HeroProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!headingRef.current || !paraRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Sophisticated Character Reveal for Title
      const split = new SplitText(headingRef.current, { type: "chars, words, lines" });
      
      gsap.from(split.chars, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        stagger: 0.02,
        duration: 1.2,
        ease: "expo.out",
      });

      // 2. Multi-stage Reveal for Paragraph
      const paraSplit = new SplitText(paraRef.current, { type: "lines" });
      gsap.from(paraSplit.lines, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 1,
        ease: "power2.out",
        delay: 0.5
      });

      // 3. Reveal container elements (CTAs, Stats)
      gsap.from(".hero-reveal", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        delay: 0.8
      });

      // 4. SVG Data Flow Animation
      gsap.to(".data-stream", {
        strokeDashoffset: -1000,
        duration: 20,
        repeat: -1,
        ease: "none"
      });

      // 5. Hero Micro-movements on Mouse Move
      window.addEventListener("mousemove", (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;
        
        gsap.to(".hero-parallax", {
          x: xPos,
          y: yPos,
          duration: 1,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, { scope: mainRef });

  return (
    <header
      ref={mainRef}
      className="z-1 relative bg-black font-mono overflow-hidden min-h-[90vh] flex flex-col bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(180deg, #000000, #1110 34%, #1110 81%, #000000), url('https://cdn.prod.website-files.com/697b2f7b5c6c6bd8ea41646d/697b9f53307ab54faa7c9276_backdrop_pattern_dark-01.svg'), url('https://cdn.prod.website-files.com/697b2f7b5c6c6bd8ea41646d/697b3469ac2d8c7bd97b5f77_697a3a6862e0e83e13e59998_ss.webp')`,
        backgroundPosition: "0 0, 0 0, 100%",
        backgroundSize: "auto, cover, contain",
      }}
    >
      {/* Dynamic SVG Background Layer */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="data-stream" d="M-100 200 C 200 100 400 400 700 300 S 1100 100 1540 250" stroke="white" strokeWidth="0.5" strokeDasharray="10 20" />
          <path className="data-stream" d="M-100 400 C 300 300 600 600 900 450 S 1200 200 1540 500" stroke="white" strokeWidth="0.5" strokeDasharray="5 15" opacity="0.5" />
          <circle cx="200" cy="150" r="2" fill="white" className="hero-parallax" />
          <circle cx="800" cy="350" r="1.5" fill="white" className="hero-parallax" />
          <circle cx="1200" cy="100" r="3" fill="white" className="hero-parallax" opacity="0.3" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-linear-to-b from-black via-transparent to-black pointer-events-none z-5" />

      <div className="container mx-auto px-6 md:px-10 py-20 md:py-40 relative z-10 grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Main Heading */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 hero-reveal">
              <Activity size={12} className="text-zinc-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Engine Stable v4.2.0</span>
            </div>
            <h1 ref={headingRef} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-mono font-bold leading-[0.85] tracking-tighter text-white">
              PAY <br />
              ANYTHING <br />
              SETTLE <br />
              <span className="text-zinc-600 italic font-light">EVERYWHERE.</span>
            </h1>
          </div>

          {/* Intro Text & CTAs */}
          <div className="flex flex-col gap-10">
            <p ref={paraRef} className="text-xl md:text-2xl font-display text-zinc-400 max-w-xl leading-relaxed font-light">
              The payment infrastructure built for{" "}
              <span className="text-white italic underline decoration-white/20 underline-offset-8">
                both sides of finance.
              </span>{" "}
              Accept any currency from any chain. Settle globally in seconds.
              One API. Zero custody risk.
            </p>
            
            <div className="flex flex-wrap gap-4 hero-reveal">
              <Button 
                variant="primary" 
                size="lg" 
                magnetic 
                className="rounded-full px-10 h-16 text-lg group"
                onClick={onWaitlistClick}
              >
                Join Waitlist
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg" 
                magnetic
                className="rounded-full px-8 h-16 group border-white/10 hover:border-white/20"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-3 transition-all group-hover:bg-white/10 group-hover:scale-110">
                  <Play size={16} fill="white" className="ml-1" />
                </div>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative border-t border-white/5 bg-black/80 backdrop-blur-3xl z-10">
        <div className="container mx-auto px-6 md:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-0">
            {[
              { label: "Settlement Time", value: "5s", sub: "Atomic Finality" },
              { label: "Avg TX FEE", value: "$0.001", sub: "Institutional Rates" },
              { label: "Network", value: "174", sub: "Countries Connected" },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className={`flex flex-col gap-2 justify-center items-start md:pl-12 hero-reveal ${
                  i !== 0 ? "md:border-l border-white/5" : ""
                }`}
              >
                <div className="font-mono text-4xl md:text-5xl text-white font-bold tracking-tighter flex items-end gap-1">
                  {stat.value}
                  {stat.value === "5s" && <span className="text-zinc-600 text-xl font-light">avg</span>}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                  {stat.label}
                </div>
                <div className="text-[10px] text-zinc-700 italic">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;

"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  Cpu,
  ArrowUpRight, 
  ArrowRightLeft,
  Navigation,
  Key
} from "lucide-react";

const features = [
  {
    t: "Inbound Layer",
    d: "Unified ingestion for Fiat (Visa, ACH, SEPA) and Cross-Chain assets. Assets from 10+ EVM chains and Solana bridged directly into Stellar liquidity pools.",
    i: ArrowRightLeft
  },
  {
    t: "Routing & Conversion",
    d: "Stellar Path Payments find the best multi-hop route across DEX/AMM pools. Quotes are locked for 30 seconds with built-in slippage protection.",
    i: Navigation
  },
  {
    t: "Settlement Layer",
    d: "Funds land in high-liquidity Stellar assets. Automated SEP-24 off-ramps deliver fiat to bank accounts and mobile money wallets across 174 countries.",
    i: Key
  },
  {
    t: "Soroban Automation",
    d: "Custom settlement logic, multi-tenant disbursement, and non-custodial fee handling executed by WASM-native smart contracts.",
    i: Cpu
  }
];

const stats = [
  { n: "~5s", l: "Finality on Stellar" },
  { n: "$0.001", l: "Average fee per tx" },
  { n: "174", l: "Targeted Fiat Rails" },
  { n: "30s", l: "Guaranteed Quotes" },
];



export function InfrastructureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const gridLinesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Initial State
    gsap.set(".infra-reveal", { y: 60, opacity: 0 });
    gsap.set(".infra-line", { scaleX: 0 });

    // Main Timeline
    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
        end: "bottom bottom",
        toggleActions: "play none none reverse",
      }
    });

    mainTl
      .to(".infra-line", { scaleX: 1, duration: 1.5, ease: "power4.inOut", stagger: 0.2 })
      .to(".infra-reveal", { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.1, 
        ease: "power3.out" 
      }, "-=1");

    // Parallax effect on grid lines
    gsap.to(gridLinesRef.current, {
      y: -100,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // 2. Pinned Layout for Desktop
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 1024px)", () => {
      // Pin the left column
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: ".infra-pin-left",
        pinSpacing: false,
        scrub: true
      });

      // Highlight features on scroll
      const featureCards = gsap.utils.toArray<HTMLElement>(".feature-card");
      featureCards.forEach((card) => {
        gsap.fromTo(card, 
          { opacity: 0.3, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: card,
              start: "top 60%",
              end: "bottom 40%",
              toggleActions: "play reverse play reverse",
            }
          }
        );
      });
    });



  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#050505] text-white overflow-hidden">
      {/* Decorative Grid Background */}
      <div ref={gridLinesRef} className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[4rem_4rem]" />
      </div>

      {/* Infrastructure Section */}
      <section className="relative py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            
            {/* Left Column: Vision & Stats (Pinned) */}
            <div className="lg:col-span-6 lg:h-screen flex flex-col justify-center gap-16 infra-pin-left">
              <div ref={titleWrapperRef} className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/2 infra-reveal">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Platform Infrastructure</span>
                </div>
                
                <h2 className="title-reveal font-display text-[48px] md:text-[80px] font-bold leading-[0.9] tracking-tight infra-reveal">
                  Multi-Layer <br />
                  <span className="text-zinc-700 italic font-light drop-shadow-sm">Settlement.</span>
                </h2>
                
                <p className="font-sans font-light text-xl text-zinc-500 leading-relaxed max-w-xl infra-reveal">
                  Built natively where traditional finance meets the decentralized frontier. 
                  Useroutr operates at the intersection of proven liquidity and instant finality.
                </p>
                
                <div className="h-px w-full bg-white/5 origin-left infra-line" />
              </div>

              <div ref={statsRef} className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden infra-reveal max-w-md">
                {stats.map((s, i) => (
                  <div key={i} className="bg-[#080808] p-6 group hover:bg-[#0c0c0c] transition-colors duration-500">
                    <div className="font-mono text-3xl font-bold mb-1 tracking-tighter text-white group-hover:translate-x-1 transition-transform">{s.n}</div>
                    <div className="font-display  text-[9px] text-zinc-600 uppercase tracking-widest">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Technical Modules (Scrolling) */}
            <div ref={featuresRef} className="lg:col-span-6 flex flex-col space-y-24 py-24">
              {features.map((f, i) => (
                <div 
                  key={i} 
                  className="feature-card group relative flex flex-col gap-6 p-8 rounded-[32px] border border-white/5 bg-white/2 backdrop-blur-sm transition-all duration-700 hover:border-white/10"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-zinc-400 group-hover:text-white group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
                    <f.i size={28} />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-zinc-700">0{i+1}</span>
                      <h4 className="font-display text-2xl font-bold text-white group-hover:translate-x-1 transition-transform duration-500 flex items-center gap-2">
                        {f.t}
                        <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                      </h4>
                    </div>
                    <p className="font-sans font-light text-lg text-zinc-500 leading-relaxed group-hover:text-zinc-300 transition-colors duration-500">
                      {f.d}
                    </p>
                  </div>

                  {/* Decorative background number */}
                  <span className="absolute top-8 right-8 font-display text-8xl font-black text-white/2 pointer-events-none transition-all duration-700 group-hover:text-white/5 group-hover:scale-110">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

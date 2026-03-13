"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  Globe, 
  Shield, 
  Database, 
  Navigation
} from "lucide-react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export function GatewayAssembler() {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  // Memoize random node positions for React purity
  const networkNodes = React.useMemo(() => {
    return [...Array(15)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
  }, []);

  useGSAP(() => {
    // 1. Scene Pinning
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=400%",
        pin: true,
        scrub: 1,
      }
    });

    // 2. Initial Setup
    gsap.set(".component-node", { opacity: 0, scale: 0.8 });
    gsap.set(".connection-line", { strokeDashoffset: 1000, strokeDasharray: 1000 });

    // PHASE 1: Macro View - Network Ingress
    tl.to(zoomContainerRef.current, {
      scale: 2,
      duration: 2,
      ease: "power2.inOut",
    }, "macro");

    tl.from(".network-node", {
      opacity: 0,
      stagger: 0.1,
      duration: 1,
    }, "macro");

    // PHASE 2: The Zoom - Micro Detail
    tl.to(zoomContainerRef.current, {
      scale: 6,
      x: "-10%",
      y: "10%",
      duration: 3,
      ease: "power3.inOut",
    }, "zoom");

    tl.to(".network-nodes", {
      opacity: 0,
      duration: 1,
    }, "zoom");

    // PHASE 3: Module Assembly
    tl.to(".component-node", {
      opacity: 1,
      scale: 1,
      stagger: 0.5,
      duration: 2,
      ease: "back.out(1.7)",
    }, "assembly");

    tl.to(".connection-line", {
      strokeDashoffset: 0,
      stagger: 0.3,
      duration: 1.5,
      ease: "none",
    }, "assembly");

    // PHASE 4: Transaction Flow
    tl.to(".tx-pulse", {
      motionPath: {
        path: "#main-path",
        align: "#main-path"
      },
      duration: 2,
      repeat: -1,
      ease: "none",
    }, "flow");

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black overflow-hidden">
      {/* Immersive Background Layer */}
      <div ref={zoomContainerRef} className="absolute inset-0 flex items-center justify-center">
        
        {/* Macro: Network Nodes */}
        <div className="network-nodes absolute inset-0 opacity-20 pointer-events-none">
          {networkNodes.map((node, i) => (
            <div 
              key={i} 
              className="network-node absolute w-2 h-2 bg-zinc-700 rounded-full"
              style={{
                top: node.top,
                left: node.left,
              }}
            />
          ))}
        </div>

        {/* Global Network Ingress Circle */}
        <div className="network-nodes absolute w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />

        {/* Micro: Gateway Core Architecture */}
        <div className="relative z-10 w-[800px] h-[600px] flex items-center justify-center">
          
          {/* Main SVG Architecture */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600">
            <defs>
              <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Connection Lines */}
            <path id="main-path" className="connection-line" d="M 100,300 L 400,300 L 700,300" stroke="url(#line-grad)" strokeWidth="2" fill="none" />
            <path className="connection-line" d="M 400,300 L 400,150 L 550,150" stroke="url(#line-grad)" strokeWidth="1" fill="none" />
            <path className="connection-line" d="M 400,300 L 400,450 L 550,450" stroke="url(#line-grad)" strokeWidth="1" fill="none" />
          </svg>

          {/* Central Core */}
          <div ref={coreRef} className="component-node relative z-20 w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
             <Image src="/logo.svg" alt="Useroutr" width={54} height={54} />
             <div className="absolute inset-0 rounded-3xl bg-white/5 animate-pulse" />
          </div>

          {/* Satellite Modules */}
          <div className="absolute left-[10%] top-[50%] -translate-y-1/2 component-node flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
              <Globe size={24} />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Bridge Ingress</span>
          </div>

          <div className="absolute right-[10%] top-[50%] -translate-y-1/2 component-node flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
              <Shield size={24} />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Stellar Anchor</span>
          </div>

          <div className="absolute left-[65%] top-[25%] component-node flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
              <Database size={20} />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-700">Verification</span>
          </div>

          <div className="absolute left-[65%] bottom-[25%] component-node flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
              <Navigation size={20} />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-700">Liquidity Path</span>
          </div>

        </div>
      </div>

      {/* Narrative Overlays (Pinned) */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Step 1: Global Connectivity */}
        <div className="story-step absolute inset-0 flex items-center justify-start px-20">
          <div className="max-w-md space-y-6">
            <h1 className="font-display text-5xl md:text-7xl font-bold italic text-white tracking-tighter">Global <br /> Ingress.</h1>
            <p className="font-sans font-light text-xl text-zinc-500 leading-relaxed">
              Accept value from any network. Ethereum, Solana, and traditional banking rails all flow into the Useroutr Gateway.
            </p>
          </div>
        </div>

        {/* Step 2: Protocol Orchestration */}
        <div className="story-step absolute inset-0 flex items-center justify-end px-20 opacity-0 pointer-events-none">
           <div className="max-w-md space-y-6 text-right">
            <h2 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tighter">Atomic <br /> Routing.</h2>
            <p className="font-sans font-light text-xl text-zinc-500 leading-relaxed">
              Every transaction is cryptographically verified and routed via Stellar path payments for sub-cent fees.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

import Image from "next/image";

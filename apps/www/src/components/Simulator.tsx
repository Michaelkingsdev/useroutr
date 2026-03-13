"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(MotionPathPlugin);
import { 
  ArrowRight, 
  RotateCcw, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Cpu,
  CornerRightDown
} from "lucide-react";
import { Button } from "./ui/button";

const ASSETS = [
  { id: "usdc-sol", label: "USDC (Solana)", color: "#14F195", icon: "S" },
  { id: "eth", label: "ETH (Ethereum)", color: "#627EEA", icon: "E" },
  { id: "usdc-base", label: "USDC (Base)", color: "#0052FF", icon: "B" },
];

const RAILS = [
  { id: "sepa", label: "EUR (SEPA)", type: "Fiat", color: "#FFD700" },
  { id: "ach", label: "USD (ACH)", type: "Fiat", color: "#54D1DB" },
  { id: "xlm", label: "XLM (Stellar)", type: "Crypto", color: "#FFFFFF" },
];

export function Simulator() {
  const [source, setSource] = useState(ASSETS[0]);
  const [dest, setDest] = useState(RAILS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [status, setStatus] = useState("Idle");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setStatus("Ingesting Asset...");

    const tl = gsap.timeline({
      onComplete: () => {
        setIsSimulating(false);
        setStatus("Settlement Confirmed");
      }
    });

    // Packet Setup
    tl.set(packetRef.current, { 
      opacity: 1, 
      scale: 1, 
      motionPath: {
        path: pathRef.current!,
        align: pathRef.current!,
        start: 0,
        end: 0
      }
    });

    // 1. Ingestion Phase
    tl.to(packetRef.current, {
      motionPath: {
        path: pathRef.current!,
        start: 0,
        end: 0.33
      },
      duration: 1,
      ease: "power2.inOut",
      onStart: () => setStatus("Ingesting Asset...")
    });

    // 2. Routing Phase (Stellar Core)
    tl.to(packetRef.current, {
      motionPath: {
        path: pathRef.current!,
        start: 0.33,
        end: 0.66
      },
      duration: 0.8,
      scale: 1.5,
      ease: "none",
      onStart: () => setStatus("Routing via Useroutr Engine..."),
      onComplete: () => {
        gsap.to(".core-node", { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
      }
    });

    // 3. Finality Phase
    tl.to(packetRef.current, {
      motionPath: {
        path: pathRef.current!,
        start: 0.66,
        end: 1
      },
      duration: 1,
      scale: 1,
      ease: "power2.inOut",
      onStart: () => setStatus("Atomic Finality...")
    });

    // Scale down and show success
    tl.to(packetRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        gsap.fromTo(".success-badge", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" });
      }
    });
  };

  const resetSimulator = () => {
    setIsSimulating(false);
    setStatus("Idle");
    gsap.set(".success-badge", { opacity: 0, scale: 0.5 });
    gsap.set(packetRef.current, { opacity: 0 });
  };

  return (
    <section ref={containerRef} className="py-32 bg-black relative border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/2">
              <Cpu size={12} className="text-zinc-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Live Protocol Simulator</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
              Test the <span className="text-zinc-700 italic font-light">Connectivity.</span>
            </h2>
            <p className="font-sans font-light text-lg text-zinc-500 max-w-xl mx-auto">
              Select your parameters and witness the speed of atomic cross-chain settlement.
            </p>
          </div>

          {/* Simulator Interface */}
          <div className="bg-[#080808] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              
              {/* Source Selection */}
              <div className="space-y-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">Inbound Rail</div>
                <div className="space-y-3">
                  {ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => !isSimulating && setSource(asset)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                        source.id === asset.id 
                          ? "bg-white/5 border-white/20 text-white" 
                          : "border-transparent text-zinc-600 hover:text-zinc-400"
                      )}
                    >
                      <span className="font-display text-sm font-bold">{asset.label}</span>
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: asset.color, boxShadow: `0 0 10px ${asset.color}` }} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Visualization */}
              <div className="relative h-64 md:h-80 flex items-center justify-center">
                {/* SVG Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                  <path 
                    ref={pathRef}
                    d="M 50 150 C 150 150, 150 150, 200 150 S 250 150, 350 150" 
                    stroke="white" 
                    strokeWidth="1" 
                    strokeDasharray="4 8" 
                    fill="none" 
                    className="opacity-10"
                  />
                </svg>

                {/* Animated Packet */}
                <div 
                  ref={packetRef}
                  className="absolute w-4 h-4 rounded-full blur-[2px] opacity-0 z-20"
                  style={{ 
                    backgroundColor: source.color,
                    boxShadow: `0 0 20px ${source.color}, 0 0 40px ${source.color}`
                  }}
                />

                {/* Stellar Core Node */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className={cn(
                    "core-node w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-black transition-all duration-700",
                    isSimulating && "border-white/30 scale-110 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                  )}>
                    <div className={cn(
                      "w-16 h-16 rounded-full border border-white/5 flex items-center justify-center bg-white/2",
                      isSimulating && "animate-pulse"
                    )}>
                      <Image src="/logo.svg" alt="U" width={32} height={32} className="opacity-40" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Processing Core</div>
                    <div className="font-display text-[10px] font-bold text-zinc-400">{status}</div>
                  </div>
                </div>

                {/* Success Badge */}
                <div className="success-badge absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 scale-50 pointer-events-none">
                  <div className="bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2">
                    <ShieldCheck className="text-emerald-500" size={16} />
                    <span className="font-display text-[11px] font-bold text-emerald-400 uppercase tracking-widest text-nowrap">Transfer Complete</span>
                  </div>
                </div>

              </div>

              {/* Destination Selection */}
              <div className="space-y-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">Settlement Rail</div>
                <div className="space-y-3">
                  {RAILS.map((rail) => (
                    <button
                      key={rail.id}
                      onClick={() => !isSimulating && setDest(rail)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                        dest.id === rail.id 
                          ? "bg-white/5 border-white/20 text-white" 
                          : "border-transparent text-zinc-600 hover:text-zinc-400"
                      )}
                    >
                      <span className="font-display text-sm font-bold">{rail.label}</span>
                      <span className="font-mono text-[8px] uppercase text-zinc-700 bg-white/2 px-2 py-0.5 rounded">{rail.type}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Simulation Trigger */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex gap-10">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Est. Finality</div>
                  <div className="font-display text-lg font-bold text-white">~5.2s</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Protocol Fee</div>
                  <div className="font-display text-lg font-bold text-white">0.35%</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Liquidity Path</div>
                  <div className="font-display text-lg font-bold text-white">Stellar Native</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!isSimulating && status === "Settlement Confirmed" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-14 h-14 text-zinc-600 hover:text-white"
                    onClick={resetSimulator}
                  >
                    <RotateCcw size={20} />
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="primary" 
                  className="rounded-full px-12 h-16 group"
                  onClick={startSimulation}
                  disabled={isSimulating}
                >
                  {isSimulating ? "Simulating..." : status === "Settlement Confirmed" ? "Redo Simulation" : "Initiate Transfer"}
                  <Zap size={18} className={cn("ml-2", isSimulating && "animate-pulse")} />
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Fixed Image import
import Image from "next/image";

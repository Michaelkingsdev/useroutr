"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { 
  Terminal, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Zap,
  Maximize2,
  Minimize2,
  Minus,
  X
} from "lucide-react";

const INITIAL_LOGS = [
  { id: 1, type: "SYSTEM", msg: "USEROUTR_ENGINE_V2_INITIALIZED", time: "09:40:12" },
  { id: 2, type: "NETWORK", msg: "PEER_CONNECTION_STABLE [174_NODES]", time: "09:40:13" },
  { id: 3, type: "INFO", msg: "LIQUIDITY_BRIDGES_ACTIVE [USDC/SOL/ETH]", time: "09:40:15" },
];

const LOG_TYPES = ["GATEWAY", "PAYOUT", "SETTLE", "BRIDGE"];
const NETWORKS = ["MAINNET", "POLYGON", "BASE", "STELLAR", "SOLANA"];

export function TerminalPreview() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [activeNodes, setActiveNodes] = useState(1420);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Memoize map dots for React purity
  const mapDots = React.useMemo(() => {
    return [...Array(40)].map(() => ({
      cx: 50 + Math.random() * 300,
      cy: 40 + Math.random() * 120,
    }));
  }, []);

  // Mock live data stream
  useEffect(() => {
    const interval = setInterval(() => {
      const type = LOG_TYPES[Math.floor(Math.random() * LOG_TYPES.length)];
      const network = NETWORKS[Math.floor(Math.random() * NETWORKS.length)];
      const id = Date.now();
      const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
      
      const newLog = {
        id,
        type,
        msg: `TXN_${type}_SUCCESS [${network} -> STELLAR]`,
        time
      };

      setLogs(prev => [...prev.slice(-14), newLog]);
      setActiveNodes(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    // Initial reveal
    gsap.from(".terminal-window", {
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: "power4.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
      }
    });

    // Pulse the map dots
    gsap.to(".map-dot", {
      scale: 1.5,
      opacity: 0.5,
      duration: 1,
      stagger: {
        each: 0.2,
        repeat: -1,
        yoyo: true
      }
    });
  }, { scope: sectionRef });

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section ref={sectionRef} className="py-32 bg-black relative border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/2">
            <Terminal size={12} className="text-zinc-500" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Institutional Interface</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
            The Industrial <span className="text-zinc-700 italic font-light">Terminal.</span>
          </h2>
          <p className="font-sans font-light text-xl text-zinc-500 max-w-xl">
            A battlefield-tested dashboard for monitoring global liquidity clusters and atomic settlement flows.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="terminal-window max-w-6xl mx-auto bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative">
          
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-20 opacity-20" />

          {/* Terminal Header */}
          <div className="bg-white/5 border-b border-white/5 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                <Activity size={10} className="animate-pulse text-zinc-400" />
                useroutr_admin_v2.01_STABLE
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-600">
              <Minimize2 size={12} />
              <Maximize2 size={12} />
              <X size={12} />
            </div>
          </div>

          {/* Terminal Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 h-[500px]">
            
            {/* Left Column: Stats & Logs */}
            <div className="lg:col-span-12 xl:col-span-5 border-r border-white/5 flex flex-col">
              
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-px bg-white/5">
                {[
                  { l: "Network State", v: "DECENTRALIZED", c: "text-zinc-300" },
                  { l: "Active Nodes", v: activeNodes.toLocaleString(), c: "text-white" },
                  { l: "Latency (ms)", v: "14.2", c: "text-zinc-300" },
                  { l: "Bridge Health", v: "OPTIMAL", c: "text-emerald-500" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#080808] p-4 space-y-1">
                    <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-600">{stat.l}</div>
                    <div className={cn("font-display text-xs font-bold", stat.c)}>{stat.v}</div>
                  </div>
                ))}
              </div>

              {/* Live Output */}
              <div 
                ref={logContainerRef} 
                className="flex-1 p-6 font-mono text-[11px] space-y-2 overflow-y-auto scrollbar-hide"
              >
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-zinc-700">[{log.time}]</span>
                    <span className={cn(
                      "font-bold",
                      log.type === "SYSTEM" ? "text-blue-400" :
                      log.type === "INFO" ? "text-zinc-400" :
                      "text-zinc-200"
                    )}>{log.type}:</span>
                    <span className="text-zinc-500 italic lowercase">{log.msg}</span>
                  </div>
                ))}
                <div className="flex gap-2 items-center text-zinc-300">
                  <span className="animate-pulse inline-block w-1.5 h-3 bg-zinc-500" />
                  <span className="text-[10px] text-zinc-700 uppercase tracking-widest">Awaiting Command...</span>
                </div>
              </div>
            </div>

            {/* Right Column: Global Map Visual */}
            <div className="hidden xl:col-span-7 bg-[#050505] lg:flex flex-col relative group">
              
              {/* Map Information Overlay */}
              <div className="absolute top-6 left-6 z-30 space-y-1">
                <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-700">Node Placement</div>
                <div className="font-display text-xs font-bold text-zinc-500 uppercase tracking-widest">Global Routing Cluster</div>
              </div>

              {/* Simplified SVG World Map */}
              <div className="flex-1 flex items-center justify-center p-12 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                <svg className="w-full h-full max-w-md" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Abstract Continents (Dots) */}
                  {mapDots.map((dot, i) => (
                    <circle 
                      key={i} 
                      className="map-dot text-zinc-800" 
                      cx={dot.cx} 
                      cy={dot.cy} 
                      r="1.5" 
                      fill="currentColor" 
                    />
                  ))}
                  
                  {/* Active Hub Connections (Lines) */}
                  <path d="M 100,80 Q 200,40 300,100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <path d="M 80,120 Q 150,150 250,90" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  
                  {/* Glowing Hubs */}
                  <circle cx="100" cy="80" r="2" fill="white" className="animate-pulse shadow-[0_0_10px_white]" />
                  <circle cx="300" cy="100" r="2" fill="white" className="animate-pulse" />
                  <circle cx="200" cy="140" r="2" fill="white" className="animate-pulse" />
                </svg>
              </div>

              {/* Footer Indicator */}
              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Secure Live Stream</span>
              </div>

            </div>

          </div>

        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 max-w-5xl mx-auto">
          {[
            { t: "Deep Monitoring", d: "Real-time visibility into every atomic vault and payment rail.", i: Activity },
            { t: "Institutional Auth", d: "Multi-sig approval workflows and RBAC policy management.", i: ShieldCheck },
            { t: "Network Expansion", d: "Instantly deploy new liquidity corridors across 174 countries.", i: Globe },
          ].map((f, i) => (
            <div key={i} className="space-y-4 group">
              <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-white transition-colors">
                <f.i size={18} />
              </div>
              <h4 className="font-display text-lg font-bold text-zinc-200">{f.t}</h4>
              <p className="font-sans font-light text-sm text-zinc-500 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-zinc-900/5 blur-[150px] rounded-full pointer-events-none" />
    </section>
  );
}

"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

interface StoryLayoutProps {
  children: React.ReactNode;
  title: string;
  category: string;
}

export function ProductStoryLayout({ children, title, category }: StoryLayoutProps) {
  const main = useRef<HTMLDivElement>(null);
  const smoother = useRef<ScrollSmoother | null>(null);

  useGSAP(() => {
    smoother.current = ScrollSmoother.create({
      wrapper: "#story-wrapper",
      content: "#story-content",
      smooth: 1.5,
      effects: true,
    });
  }, { scope: main });

  return (
    <div ref={main} className="bg-black text-white selection:bg-white/10 overflow-hidden">
      {/* Narrative Progress Header */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex items-center justify-between pointer-events-none">
        <Link 
          href="/" 
          className="pointer-events-auto flex items-center gap-3 group bg-white/2 border border-white/5 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
          <span className="font-mono text-xs text-zinc-400 group-hover:text-white uppercase tracking-widest">Back to Engine</span>
        </Link>

        <div className="flex items-center gap-4 bg-white/2 border border-white/5 backdrop-blur-md px-5 py-2 rounded-full">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[8px] uppercase tracking-tighter text-zinc-600 leading-none">{category}</span>
            <span className="font-display text-sm font-bold text-white uppercase tracking-widest leading-none mt-1">{title}</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
            <Cpu size={18} className="text-zinc-400" />
          </div>
        </div>
      </nav>

      {/* Story Content Wrapper */}
      <div id="story-wrapper">
        <div id="story-content">
          {children}
          
          {/* Shared Story Footer */}
          <footer className="py-40 bg-[#050505] border-t border-white/5 text-center">
            <div className="max-w-2xl mx-auto space-y-8 px-6">
              <h3 className="font-display text-3xl font-bold text-white italic">The future of movement.</h3>
              <p className="font-sans font-light text-lg text-zinc-500">
                Useroutr architecture is designed for institutional scale and millisecond finality.
              </p>
              <div className="pt-10">
                <Link 
                  href="/#pricing" 
                  className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-display font-bold hover:scale-105 transition-transform"
                >
                  Start Scaling Now
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

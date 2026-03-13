"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function SoundSystem() {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context on first interaction
  const initAudio = React.useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playTick = React.useCallback((freq = 800, type: OscillatorType = "sine", volume = 0.05) => {
    if (isMuted || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [isMuted]);

  const playSwell = React.useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [isMuted]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, .interactive-trigger")) {
        playTick(1200, "sine", 0.02);
      }
    };

    const handleClick = () => {
      initAudio();
      playTick(400, "square", 0.03);
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("click", handleClick);
    };
  }, [isMuted]);

  return (
    <div className="fixed bottom-8 right-8 z-[10000] flex items-center gap-4 group">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full pl-4 pr-1 py-1 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
        <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">Aural Interface</span>
        <button 
          onClick={() => {
            initAudio();
            setIsMuted(!isMuted);
          }}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
      
      {/* Visual pulse for mute state */}
      <div className={`w-3 h-3 rounded-full border border-white/20 flex items-center justify-center `}>
         <div className={`w-1 h-1 rounded-full ${isMuted ? 'bg-zinc-800' : 'bg-white animate-pulse'}`} />
      </div>
    </div>
  );
}

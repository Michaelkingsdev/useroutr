"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorType, setCursorType] = useState<"default" | "plus" | "text" | "pointer">("default");

  useGSAP(() => {
    // 1. Smooth Mouse Movement
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.2, ease: "power3" });
    
    const xFollowTo = gsap.quickTo(followerRef.current, "x", { duration: 0.6, ease: "power3" });
    const yFollowTo = gsap.quickTo(followerRef.current, "y", { duration: 0.6, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xFollowTo(e.clientX);
      yFollowTo(e.clientY);
    });

    // 2. Global Hover Detection
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isPointer = window.getComputedStyle(target).cursor === "pointer";
      const isTerminal = target.closest(".terminal-window");
      const isTechnical = target.closest(".feature-card, .component-node, .connectivity-node");
      
      if (isTerminal || isTechnical) {
        setCursorType("plus");
      } else if (isPointer) {
        setCursorType("pointer");
      } else {
        setCursorType("default");
      }
    };

    window.addEventListener("mouseover", handleMouseMove);

    return () => {
      window.removeEventListener("mouseover", handleMouseMove);
    };
  }, []);

  // 3. Morphology Logic
  useGSAP(() => {
    const tl = gsap.timeline({ overwrite: "auto" });

    if (cursorType === "pointer") {
      tl.to(followerRef.current, {
        scale: 2.5,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.2)",
        duration: 0.3
      });
      tl.to(cursorRef.current, { scale: 0.5, duration: 0.3 }, "<");
    } else if (cursorType === "plus") {
      tl.to(followerRef.current, {
        width: 40,
        height: 40,
        borderRadius: "0%",
        rotate: 45,
        backgroundColor: "transparent",
        borderColor: "rgba(255,255,255,0.4)",
        duration: 0.4
      });
      tl.to(cursorRef.current, { scale: 1, duration: 0.3 }, "<");
    } else {
      tl.to(followerRef.current, {
        scale: 1,
        width: 32,
        height: 32,
        borderRadius: "100%",
        rotate: 0,
        backgroundColor: "transparent",
        borderColor: "rgba(255,255,255,0.1)",
        duration: 0.3
      });
      tl.to(cursorRef.current, { scale: 1, duration: 0.3 }, "<");
    }
  }, [cursorType]);

  return (
    <>
      <style jsx global>{`
        body * { cursor: none !important; }
      `}</style>
      
      {/* Main Cursor Dot */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      
      {/* Follower Ring */}
      <div 
        ref={followerRef} 
        className="fixed top-0 left-0 w-8 h-8 border border-white/10 rounded-full pointer-events-none z-[9998] flex items-center justify-center transition-opacity duration-300"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        {cursorType === "plus" && (
           <div className="absolute w-px h-4 bg-white/20 rotate-45" />
        )}
      </div>
    </>
  );
}

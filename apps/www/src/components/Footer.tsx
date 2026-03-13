"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Globe,
  ArrowRight
} from "lucide-react";
import { Button } from "./ui/button";

interface FooterProps {
  onWaitlistClick: () => void;
}

const footerNavigation = {
  solutions: [
    { name: "Checkout", href: "https://thirtn.mintlify.app/products#tavio-gateway" },
    { name: "Payouts", href: "https://thirtn.mintlify.app/products#tavio-payouts" },
    { name: "Invoicing", href: "https://thirtn.mintlify.app/products#tavio-invoicing" },
    { name: "Status", href: "#" },
  ],
  developers: [
    { name: "Documentation", href: "https://thirtn.mintlify.app/" },
    { name: "API Reference", href: "https://thirtn.mintlify.app/api-reference/introduction" },
    { name: "SDKs", href: "https://thirtn.mintlify.app/sdks" },
    { name: "GitHub", href: "https://github.com/tavio" },
  ],
  company: [
    { name: "Dashboard", href: "https://dashboard.tavio.io" },
    { name: "X (Twitter)", href: "https://x.com/tavio" },
    { name: "Privacy", href: "https://thirtn.mintlify.app/security" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://x.com/tavio", name: "Twitter" },
  { icon: Github, href: "https://github.com/tavio", name: "GitHub" },
  { icon: Linkedin, href: "#", name: "LinkedIn" },
];

export function Footer({ onWaitlistClick }: FooterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Initial states for "blueprint" construction
    gsap.set(".footer-line", { scaleX: 0, scaleY: 0, opacity: 0 });
    gsap.set(".footer-block", { opacity: 0, y: 30 });
    gsap.set(".footer-signature", { opacity: 0, letterSpacing: "-0.08em" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      }
    });

    tl.to(".footer-line", { 
      scaleX: 1, 
      scaleY: 1, 
      opacity: 0.1, 
      duration: 1.5, 
      stagger: 0.1, 
      ease: "power4.inOut" 
    })
    .to(".footer-block", { 
      opacity: 1, 
      y: 0, 
      duration: 0.8, 
      stagger: 0.05, 
      ease: "power3.out" 
    }, "-=0.8");

    // Independent ScrollTrigger for the big signature to expand as you scroll down
    gsap.fromTo(".footer-signature", 
      { 
        letterSpacing: "-0.1em",
        opacity: 0,
        filter: "blur(10px)"
      },
      {
        letterSpacing: "0.05em",
        opacity: 0.9,
        filter: "blur(0px)",
        scrollTrigger: {
          trigger: ".footer-signature",
          start: "top 95%",
          end: "bottom bottom",
          scrub: 1.5,
        }
      }
    );

    // Magnetic effect for social links
    const socials = gsap.utils.toArray<HTMLElement>(".social-magnetic");
    socials.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.5,
          y: y * 0.5,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      });
    });

  }, { scope: containerRef });

  return (
    <footer ref={containerRef} className="bg-black text-white pt-32 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Main Brand Block */}
          <div className="lg:col-span-4 footer-block">
            <Link href="/" className="inline-block mb-10 opacity-90 hover:opacity-100 transition-opacity">
              <Image src="/logo.svg" alt="Useroutr" width={110} height={32} className="w-auto h-7" />
            </Link>
            <p className="font-sans text-sm text-zinc-600 font-light leading-relaxed max-w-sm mb-12">
              Architecting the future of multi-chain atomic settlement. Optimized for institutional scale, built on open-source rails.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((s) => (
                <a 
                  key={s.name}
                  href={s.href}
                  className="social-magnetic w-10 h-10 rounded-xl border border-white/5 bg-white/2 flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all duration-500"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 relative">
              {/* Vertical connector lines */}
              <div className="hidden md:block absolute -left-12 top-0 bottom-0 w-px bg-white footer-line origin-top" />
              <div className="hidden md:block absolute left-1/3 top-0 bottom-0 w-px bg-white footer-line origin-top" />
              <div className="hidden md:block absolute left-2/3 top-0 bottom-0 w-px bg-white footer-line origin-top" />

              <div className="footer-block">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-800 mb-8">Engineering</h4>
                <ul className="space-y-4">
                  {footerNavigation.solutions.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="group flex items-center gap-2 font-display text-sm text-zinc-500 hover:text-white transition-colors">
                        {item.name}
                        <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-block">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-800 mb-8">Protocol</h4>
                <ul className="space-y-4">
                  {footerNavigation.developers.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="group flex items-center gap-2 font-display text-sm text-zinc-500 hover:text-white transition-colors">
                        {item.name}
                        <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-block">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-800 mb-8">Labs</h4>
                <ul className="space-y-4">
                  {footerNavigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="group flex items-center gap-2 font-display text-sm text-zinc-500 hover:text-white transition-colors">
                        {item.name}
                        <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Baseline */}
        <div className="relative pt-12 pb-20 footer-block border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-100">Network Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-zinc-800" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-100">AES-256 Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-zinc-800" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-100">V4.2.0 Core</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-zinc-800" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-100">Institutional Load</span>
              </div>
            </div>
            
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-100 flex items-center gap-4">
              <span>© 2026 USEROUTR</span>
              <span className="w-1 h-1 rounded-full bg-zinc-900" />
              <span>TERMINAL_01</span>
            </div>
          </div>
        </div>

        {/* Final CTA Block */}
        <div className="z-100 relative footer-block py-20 flex flex-col items-center text-center">
          <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-8 tracking-tighter">
            Ready to scale your <span className="text-zinc-700 italic">settlement layers?</span>
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" magnetic className="rounded-full" onClick={onWaitlistClick}>
              Launch Terminal
              <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full border-white/5 bg-white/2">
              Review Architecture
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Brand Signature Overlay */}
      <div className="relative w-full pointer-events-none select-none -mt-20 lg:-mt-32">
        <div className="absolute inset-0 bg-linear-to-b from-black via-transparent to-transparent h-48 z-30" />
        <h2 
          className="footer-signature font-display font-black text-[15vw] bg-clip-text bg-linear-to-b text-transparent from-black via-transparent to-transparent leading-[-0.6] text-center whitespace-nowrap"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.9) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          USEROUTR
        </h2>
      </div>
    </footer>
  );
}

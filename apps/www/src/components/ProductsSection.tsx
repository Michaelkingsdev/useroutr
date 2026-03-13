"use client";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { 
  CreditCard, 
  Globe, 
  FileText, 
  RefreshCw, 
  Palette,
  CheckCircle2,
  ArrowRightLeft,
  Settings,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function ProductsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Staggered Entrance for Bento Grid
    gsap.from(".bento-item", {
      opacity: 0,
      y: 50,
      scale: 0.9,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 80%",
      }
    });

    // 2. 3D Tilt Effect on Hover
    const items = gsap.utils.toArray<HTMLElement>(".bento-item");
    items.forEach((item) => {
      item.addEventListener("mousemove", (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        gsap.to(item, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.02,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto"
        });
      });

      item.addEventListener("mouseleave", () => {
        gsap.to(item, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-black relative overflow-hidden border-t border-white/5">
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Core Product <br />
            <span className="text-zinc-600 italic font-light">Modules.</span>
          </h2>
          <p className="text-xl text-zinc-500 font-mono tracking-tight">
            Independent layers of institutional payment infrastructure, unified by one API.
          </p>
        </div>
        
        <div ref={gridRef}>
          <BentoGrid className="mx-auto md:auto-rows-[20rem]">
            {products.map((item, i) => (
              <div key={i} className={cn("group/tile relative", item.span)}>
                <BentoGridItem
                  title={item.title}
                  description={item.description}
                  header={item.header}
                  className={cn("bento-item transition-none [&>p:text-lg] h-full")}
                  icon={item.icon}
                />
                {item.slug && (
                  <Link 
                    href={`/products/${item.slug}`}
                    className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover/tile:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px] rounded-xl"
                  >
                    <div className="bg-white text-black px-6 py-2 rounded-full font-display font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover/tile:translate-y-0 transition-transform">
                      Explore Flow
                      <ArrowUpRight size={16} />
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}

const SkeletonCheckout = () => {
  const iconRef = useRef(null);
  
  useGSAP(() => {
    gsap.to(iconRef.current, {
      y: -5,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "power1.inOut"
    });
  }, { scope: iconRef });

  return (
    <div className="flex flex-1 w-full h-full min-h-24 bg-clear flex-col space-y-2 justify-center items-center">
      <div
        ref={iconRef}
        className="flex flex-row rounded-2xl border border-white/10 p-4 items-center space-x-4 bg-black/50 backdrop-blur-sm shadow-2xl"
      >
        <div className="h-10 w-10 rounded-full bg-blue/20 flex items-center justify-center">
          <CreditCard className="text-blue h-6 w-6" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-24 bg-white/10 rounded-full" />
          <div className="h-2 w-16 bg-white/5 rounded-full" />
        </div>
        <div className="ml-4">
          <CheckCircle2 className="text-green h-6 w-6 animate-pulse" />
        </div>
      </div>
      <div className="flex space-x-2 opacity-50">
        <div className="h-8 w-12 rounded bg-white/5" />
        <div className="h-8 w-12 rounded bg-white/5" />
        <div className="h-8 w-12 rounded bg-white/5" />
      </div>
    </div>
  );
};

const SkeletonPayouts = () => {
  const globeRef = useRef(null);

  useGSAP(() => {
    gsap.to(globeRef.current, {
      rotate: 360,
      duration: 20,
      repeat: -1,
      ease: "none"
    });
  }, { scope: globeRef });

  return (
    <div className="flex flex-1 w-full h-full min-h-24 relative items-center justify-center overflow-hidden">
      <div ref={globeRef}>
        <Globe className="h-24 w-24 text-teal/20" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className={cn(
              "absolute h-2 w-2 rounded-full",
              i === 1 ? "bg-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]" : "bg-blue shadow-[0_0_10px_rgba(59,130,246,0.5)] opacity-50"
            )}
            style={{
              animation: `pulse ${2 + i}s infinite ease-in-out`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SkeletonInvoicing = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-24 flex-col p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-10 rounded-lg border border-white/5 bg-white/2 flex items-center px-4 justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="h-2 w-12 bg-white/10 rounded-full" />
          </div>
          <div className="h-2 w-16 bg-amber/30 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
};

const SkeletonRamps = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-24 items-center justify-center p-4">
      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center bg-blue2/10">
            <span className="text-white font-bold text-lg">$</span>
          </div>
          <span className="text-[10px] text-white/40 uppercase font-mono">Fiat</span>
        </div>
        <ArrowRightLeft className="text-blue2 h-6 w-6 animate-spin-slow" />
        <div className="flex flex-col items-center space-y-2">
          <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center bg-blue/10">
             <div className="h-6 w-6 rounded-full border-2 border-blue border-t-transparent animate-spin" />
          </div>
          <span className="text-[10px] text-white/40 uppercase font-mono">Crypto</span>
        </div>
      </div>
    </div>
  );
};

const SkeletonWhiteLabel = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-24 p-4 flex-col space-y-4">
      <div className="flex items-center space-x-3">
        <Settings className="h-5 w-5 text-zinc-500" />
        <div className="h-2 w-24 bg-white/10 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-20 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col justify-end">
          <div className="h-1.5 w-12 bg-white/10 rounded-full" />
        </div>
        <div className="h-20 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col justify-end">
          <div className="h-1.5 w-12 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const products = [
  {
    title: "Useroutr Gateway",
    slug: "gateway",
    description: "Accept credit cards, ACH/SEPA, and 20+ crypto assets in one low-latency session. PCI-DSS compliance is handled entirely by our infrastructure.",
    header: <SkeletonCheckout />,
    icon: <CreditCard className="h-4 w-4 text-neutral-500" />,
    span: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "Useroutr Payouts",
    slug: "payouts",
    description: "Bulk payout API for bank accounts and mobile money providers. Automatic FX conversion with real-time status tracking.",
    header: <SkeletonPayouts />,
    icon: <Globe className="h-4 w-4 text-neutral-500" />,
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Useroutr Invoicing",
    slug: "invoicing",
    description: "Professional billing workflow with automatic reconciliation. HTLC-secured payments mapped to your order lifecycle.",
    header: <SkeletonInvoicing />,
    icon: <FileText className="h-4 w-4 text-neutral-500" />,
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Useroutr On/Off Ramp",
    description: "Bridge fiat and crypto natively. Licensed anchor network connectivity across 174 countries for instant on-chain liquidity.",
    header: <SkeletonRamps />,
    icon: <RefreshCw className="h-4 w-4 text-neutral-500" />,
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Useroutr Links",
    description: "No-code payment links for invoices or e-commerce. Share via URL, QR code, or social, with full conversion tracking.",
    header: <SkeletonWhiteLabel />,
    icon: <Palette className="h-4 w-4 text-neutral-500" />,
    span: "md:col-span-2 lg:col-span-1",
  },
];

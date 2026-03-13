"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { 
  Terminal, 
  ChevronRight, 
  Copy, 
  Check, 
  Cpu, 
  Globe, 
  ShieldCheck,
  Code2
} from "lucide-react";

const codeSnippets = [
  {
    id: "checkout",
    title: "checkout.ts",
    icon: ShieldCheck,
    code: `import { UseroutrCheckout } from "@useroutr/sdk";

const checkout = new UseroutrCheckout({
  apiKey: "uo_live_root_xxxxxxxx",
  amount: 5000, // in cents
  currency: "USD",
  settlementAsset: "USDC", // Settle in stablecoins
  orderId: "order_123",
  onSuccess: (payment) => {
    console.log("Atomic settlement verified:", payment.hash);
  },
});

checkout.open();`
  },
  {
    id: "payouts",
    title: "payouts.json",
    icon: Globe,
    code: `{
  "payouts": [
    {
      "recipient_id": "rec_abc123",
      "amount": 10000,
      "currency": "NGN",
      "destination": {
        "type": "mobile_money",
        "provider": "mtn",
        "number": "+2348012345678"
      }
    },
    {
      "recipient_id": "rec_def456",
      "amount": 500,
      "currency": "USD",
      "destination": {
        "type": "bank_account",
        "routing": "021000021",
        "account": "1234567890"
      }
    }
  ]
}`
  },
  {
    id: "invoicing",
    title: "invoicing.ts",
    icon: Cpu,
    code: `import { UseroutrInvoicing } from "@useroutr/sdk";

// Issue professional cross-border invoice
const invoice = await UseroutrInvoicing.create({
  customer: "cust_9921",
  items: [
    { description: "Liquidity Provision", amount: 500000 }
  ],
  acceptedChains: ["stellar", "ethereum", "solana"],
  automaticOffRamp: true
});

console.log("Invoice Live:", invoice.url);`
  }
];

export function CodeSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Initial state for assembly
    gsap.set(".code-part", { opacity: 0, y: 50 });
    gsap.set(".editor-frame", { scale: 0.95, opacity: 0 });
    gsap.set(".floating-icon", { opacity: 0, filter: "blur(10px)" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 60%",
        end: "bottom bottom",
        toggleActions: "play none none reverse",
      }
    });

    tl.to(".editor-frame", { 
      opacity: 1, 
      scale: 1, 
      duration: 1.2, 
      ease: "power4.out" 
    })
    .to(".code-part", { 
      opacity: 1, 
      y: 0, 
      duration: 0.8, 
      stagger: 0.1, 
      ease: "power3.out" 
    }, "-=0.8")
    .to(".floating-icon", { 
      opacity: 0.05, 
      filter: "blur(4px)", 
      duration: 1.5, 
      stagger: 0.2 
    }, "-=1");

    // Parallax for background
    gsap.to(backgroundRef.current, {
      y: -50,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }, { scope: containerRef });

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="relative py-48 bg-[#020202] text-white overflow-hidden">
      {/* Abstract Background Elements */}
      <div ref={backgroundRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 floating-icon">
          <Code2 size={400} />
        </div>
        <div className="absolute bottom-1/4 right-10 floating-icon">
          <Terminal size={400} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/2 code-part">
            <span className="w-1 h-1 rounded-full bg-zinc-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Developer First</span>
          </div>
          <h2 className="font-display text-[48px] md:text-[64px] font-bold tracking-tight leading-none code-part">
            Integrate in <span className="text-zinc-600 italic font-light">Minutes.</span>
          </h2>
          <p className="font-sans font-light text-xl text-zinc-500 max-w-2xl mx-auto code-part">
            A TypeScript-first SDK that abstracts complex network bridging, atomic settlement, and multi-currency routing into half a dozen lines.
          </p>
        </div>

        <div className="relative group editor-frame">
          {/* Editor Header / Chrome */}
          <div className="absolute -inset-px bg-linear-to-b from-white/10 to-transparent rounded-2xl -z-10 group-hover:from-white/20 transition-all duration-700" />
          
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl">
            <div className="flex flex-col md:flex-row border-b border-white/5">
              {/* Sidebar Tabs (on MD+) */}
              <div className="flex md:flex-col border-r border-white/5 bg-[#080808]">
                {codeSnippets.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveTab(i)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-5 text-left transition-all duration-300 relative group",
                      activeTab === i 
                        ? "text-white bg-white/5" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/2"
                    )}
                  >
                    <s.icon size={18} className={cn(
                      "transition-colors",
                      activeTab === i ? "text-zinc-200" : "text-zinc-700"
                    )} />
                    <span className="font-mono text-sm hidden lg:block">{s.title}</span>
                    {activeTab === i && (
                      <div className="absolute bottom-0 left-0 w-full h-[2px] md:h-full md:w-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Main Workspace */}
              <div className="flex-1 min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050505] space-x-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex gap-1.5 mr-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded text-[11px] font-mono text-zinc-500 whitespace-nowrap">
                      @useroutr/sdk <ChevronRight size={10} /> {codeSnippets[activeTab].title}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95 text-zinc-600 hover:text-white"
                  >
                    {copied ? <Check size={16} className="text-zinc-300" /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="flex-1 p-6 md:p-10 font-mono text-sm relative overflow-hidden group/code">
                  <div className="absolute inset-0 bg-linear-to-b from-white/1 to-transparent pointer-events-none" />
                  
                  <SyntaxHighlighter
                    language="typescript"
                    style={materialDark}
                    customStyle={{
                      background: 'transparent',
                      padding: 0,
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.7',
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: 'inherit',
                      }
                    }}
                  >
                    {codeSnippets[activeTab].code}
                  </SyntaxHighlighter>
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-[#080808] flex items-center justify-between text-[10px] font-mono text-zinc-700">
                  <div className="flex gap-6">
                    <span className="flex items-center gap-2"><span className="w-1 hs rounded-full bg-zinc-800" /> UTF-8</span>
                    <span className="flex items-center gap-2"><span className="w-1 hs rounded-full bg-zinc-800" /> TypeScript</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-800">USEROUTR_ENGINE_v4.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

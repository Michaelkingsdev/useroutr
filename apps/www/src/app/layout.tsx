import type { Metadata } from "next";
import "./globals.css";
import { Syne, Newsreader, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { StructuredData } from "@/components/StructuredData";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["300", "400"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "Useroutr — The Institutional Payment Protocol for Universal Asset Finality",
  description:
    "Institutional payment infrastructure for cross-chain asset finality. Accept any currency from any chain and settle globally in seconds with Useroutr's atomic gateway.",
  keywords: [
    "Institutional Payments",
    "Cross-chain Settlement",
    "Stellar Anchor Network",
    "Atomic Finality",
    "Payment Gateway",
    "Blockchain Infrastructure",
    "Useroutr Protocol"
  ],
  authors: [{ name: "Useroutr Labs" }],
  creator: "Useroutr Labs",
  publisher: "Useroutr Labs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://useroutr.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Useroutr — Pay anything. Settle everywhere.",
    description: "The payment infrastructure built for both sides of finance. Accept any currency from any chain. Settle globally in seconds.",
    url: "https://useroutr.com",
    siteName: "Useroutr",
    images: [
      {
        url: "/og-image.jpg", // Placeholder - the user should add a real high-res image
        width: 1200,
        height: 630,
        alt: "Useroutr Protocol Overview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Useroutr — Institutional Asset Finality",
    description: "High-throughput payment protocol for universal asset finality and atomic settlement.",
    creator: "@useroutr",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={cn(
        "dark selection:bg-blue/30 selection:text-white",
        syne.variable,
        newsreader.variable,
        jetbrains.variable
      )} 
    >
      <body className="antialiased">
        <StructuredData />
        {children}
      </body>
    </html>
  );
}

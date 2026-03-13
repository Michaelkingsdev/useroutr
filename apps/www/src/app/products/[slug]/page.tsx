"use client";

import { useParams } from "next/navigation";
import { ProductStoryLayout } from "@/components/stories/ProductStoryLayout";
import { GatewayAssembler } from "@/components/stories/GatewayAssembler";

export default function ProductStoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const getProductData = () => {
    switch (slug) {
      case "gateway":
        return {
          title: "Gateway",
          category: "L1/L2 Ingress",
          component: <GatewayAssembler />
        };
      case "payouts":
        return {
          title: "Disbursements",
          category: "Global Settlement",
          component: <div className="min-h-screen flex items-center justify-center font-display text-4xl italic text-zinc-800">Payout Assembler Coming Soon</div>
        };
      case "invoicing":
        return {
          title: "Invoicing",
          category: "Pay-by-Link",
          component: <div className="min-h-screen flex items-center justify-center font-display text-4xl italic text-zinc-800">Invoicing Assembler Coming Soon</div>
        };
      default:
        return null;
    }
  };

  const product = getProductData();

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Protocol Module Not Found</div>
      </div>
    );
  }

  return (
    <ProductStoryLayout title={product.title} category={product.category}>
      {product.component}
    </ProductStoryLayout>
  );
}

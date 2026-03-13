import React from "react";

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Useroutr",
    "url": "https://useroutr.com",
    "logo": "https://useroutr.com/logo.svg",
    "sameAs": [
      "https://twitter.com/useroutr",
      "https://github.com/useroutr",
      "https://linkedin.com/company/useroutr"
    ],
    "description": "Institutional payment infrastructure for universal asset finality and atomic settlement."
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Useroutr Protocol",
    "applicationCategory": "FinancialApplication",
    "operatingSystem": "Web",
    "abstract": "A high-throughput decentralized payment protocol built for institutional-grade cross-chain finality.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}

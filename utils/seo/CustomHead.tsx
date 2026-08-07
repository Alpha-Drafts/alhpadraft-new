/**
 * @description This file contains the CustomHead component for managing SEO and meta tags in a Next.js application.
 * It allows for dynamic updates of the page title, description, and other meta tags based on the current page's content.
 * The component also includes default values and handles indexing rules for search engines.
 */

import Head from "next/head";
import site from "@/site.metadata";

interface CustomHeadProps {
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  keywords?: string;
  type?: "website" | "article";
  author?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

// Default JSON-LD schemas for site-wide structured data
const defaultJsonLd: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AlphaDrafts",
    legalName: "Visionary Insights LLC",
    url: site.url,
    logo: `${site.url}/doauditorlogo.png`,
    description:
      "AlphaDrafts builds tools that help people submit better written work. DocAuditor is the flagship pre-submission document verification platform.",
    contactPoint: {
      "@type": "ContactPoint",
      email: site.contact.emails.info,
      contactType: "customer support",
    },
    sameAs: [
      site.social_handles.facebook,
      site.social_handles.twitter,
      site.social_handles.instagram,
      site.social_handles.linkedin,
    ].filter(link => link && link !== "#"),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DocAuditor",
    alternateName: "AlphaDrafts DocAuditor",
    url: site.url,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "DocAuditor is a pre-submission document verification platform that checks written work for AI-generated content flags, plagiarism source matches, and missing brief requirements — with sentence-level detail on exactly what to fix.",
    creator: {
      "@type": "Organization",
      name: "AlphaDrafts",
    },
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free Plan",
        description:
          "3 AI Originality checks per month on documents up to 1,000 words. No credit card required.",
      },
      {
        "@type": "Offer",
        price: "5",
        priceCurrency: "USD",
        name: "Pay-Per-Check",
        description:
          "Buy credits as needed. All three check types available. Credits never expire.",
      },
      {
        "@type": "Offer",
        price: "9.50",
        priceCurrency: "USD",
        name: "Monthly Subscription",
        description:
          "40,000 credits monthly. All three checks, no word limit, priority processing. Cancel anytime.",
      },
    ],
    featureList: [
      "AI Originality Check — detects sentences matching AI writing patterns",
      "Plagiarism Source Check — finds matches against published sources with direct links",
      "Alignment Brief Check — verifies document against assignment instructions and requirements",
      "Sentence-level highlighting with color-coded issue types",
      "Integrated editor with edit-recheck workflow",
      "Supports DOCX, PDF, and direct text input",
      "Auto-save with up to 5 snapshot versions",
      "Prioritized issue feed with actionable suggestions",
    ],
    screenshot: `${site.url}/cover.jpg`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1200",
      bestRating: "5",
    },
  },
];

// CustomHead component for managing SEO and meta tags
const CustomHead = (props: CustomHeadProps) => {
  // Default values for SEO properties
  // If the properties are not provided, fallback to site metadata or default values
  const title = props.title || site.title || "Default Title";
  const description =
    props.description || site.description || "Default Description";
  const url = props.url || site.url || "";
  const imageUrl = props.imageUrl || site.cover_image || "/favicon.ico";
  const imageAlt = props.imageAlt || site.cover_image_alt || title;
  const keywords = props.keywords || site.keywords || "";
  const type = props.type || site.type || "website";
  const author = props.author || site.blog.author || "AlphaDrafts";
  const twitter = site.twitter_handle || "";
  const noIndex = props.noIndex ?? false;
  const canonicalUrl = props.canonicalUrl || url;

  // Check if the environment is production
  // This allows for the pages to be indexed only in production
  const isProduction =
    process.env.NEXT_PUBLIC_NODE_ENV === "production" ||
    process.env.NODE_ENV === "production";

  const jsonLdData = props.jsonLd || defaultJsonLd;
  const jsonLdArray = Array.isArray(jsonLdData) ? jsonLdData : [jsonLdData];

  return (
    <Head>
      {/* Language meta tag */}
      <meta httpEquiv="Content-Language" content="en" />

      {/* Favicon and app icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Indexing rules for search engines and AI crawlers */}
      <meta
        name="robots"
        content={
          isProduction && noIndex === false
            ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            : "noindex, nofollow"
        }
      />

      {/* Page title */}
      <title>{title}</title>

      {/* SEO Meta Tags */}
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="type" content={type} />
      <meta name="author" content={author} />
      <meta name="application-name" content="DocAuditor by AlphaDrafts" />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content="AlphaDrafts DocAuditor" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta
        name="twitter:card"
        content={imageUrl ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:site" content={twitter} />
      <meta name="twitter:creator" content={twitter} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />
      <meta property="twitter:image:alt" content={imageAlt} />

      {/* Canonical URL to prevent duplicate content */}
      <link rel="canonical" href={canonicalUrl} />

      {/* JSON-LD Structured Data for search engines and AI systems */}
      {jsonLdArray.map((schema, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
};

export default CustomHead;

/**
 * @description Configuration object containing global site metadata.
 * Includes information such as site title, description, social media links, contact details, and analytics IDs.
 * This data is typically used for SEO, social sharing, and general site setup.
 */

import icon from "@/public/alphadrafticon.png";
import iconWhite from "@/public/alphadrafticon.png";
import logo from "@/public/doauditorlogo.png";
import logoWhite from "@/public/logowhitead.svg";

const site = {
  url: "https://alphadrafts.com",
  title:
    "DocAuditor by AlphaDrafts — AI Detection, Plagiarism & Brief Alignment Checker",
  description:
    "DocAuditor is a pre-submission document verification platform by AlphaDrafts. Check your work for AI-generated content flags, plagiarism source matches, and missing brief requirements — with sentence-level detail on exactly what to fix. Used by students, researchers, and professionals worldwide.",
  cover_image: "https://alphadrafts.com/cover.jpg",
  cover_image_alt:
    "DocAuditor by AlphaDrafts — pre-submission document verification platform",
  twitter_handle: "@alphadrafts",
  keywords:
    "DocAuditor, AlphaDrafts, AI detection, AI content detector, plagiarism checker, plagiarism detection, pre-submission verification, document verification, AI writing detector, AI checker, originality check, source matching, brief alignment check, alignment checker, academic integrity, content authenticity, AI-generated content detection, assignment brief checker, requirement alignment, essay checker, research paper checker, thesis checker, document review, sentence-level highlights, writing verification",
  type: "website",
  icon: icon,
  whiteIcon: iconWhite,
  logo: logo,
  whiteLogo: logoWhite,

  // Brand Colors
  colors: {
    primary: "#3A0CA3",
    secondary: "#4895EF",
    neutral: "#767676",
  },

  /**
   * @description Google Analytics and other tracking/analytics service configurations.
   * Leave the value empty or undefined if not in use.
   */
  analytics: {
    google: "",
  },

  /**
   * @description Blog-related metadata including name, URL, and default author.
   * Used for identifying blog-specific content across the site.
   */
  blog: {
    name: "AlphaDrafts Blog",
    url: "https://blog.alphadrafts.com",
    author: "AlphaDrafts",
  },

  /**
   * @description All contact-related information for the site.
   * Includes phone number, physical address, and relevant email addresses.
   * Useful for footers, contact pages, or metadata.
   */
  contact: {
    phone_number: "",
    address: "#",
    emails: {
      info: "hello@alphadrafts.com",
      sales: "#",
    },
  },

  /**
   * @description Links to the site's mobile applications on various platforms.
   */
  apps: {
    android: "#",
    ios: "#",
  },

  /**
   * @description Social media handles and profile links for the brand or site.
   * These are used for linking and sharing content on social platforms.
   */
  social_handles: {
    community: "#",
    facebook: "https://www.facebook.com/alphadrafts",
    twitter: "https://x.com/alphadrafts_",
    instagram: "https://www.instagram.com/alphadrafts_/",
    linkedin: "https://www.linkedin.com/company/alphadrafts/",
    youtube: "#",
    github: "#",
  },
};

export default site;

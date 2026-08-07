import HomePageWrapper from "@/components/public/home";
import PublicLayout from "@/layouts/PublicLayout";
import site from "@/site.metadata";
import { CustomHead } from "@/utils";
import React from "react";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AlphaDrafts DocAuditor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DocAuditor is a pre-submission document verification platform by AlphaDrafts. It checks your written work for AI-generated content flags, plagiarism/source matches, and missing requirements — then shows you exactly what to fix, sentence by sentence.",
      },
    },
    {
      "@type": "Question",
      name: "What does the Alignment Brief Check do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It compares your document against the original instructions, rubric, or project brief. You get a checklist of every requirement — showing which ones are met and which ones are missing — so you can fix gaps before submission. This is DocAuditor's most unique feature — no mainstream competitor offers this.",
      },
    },
    {
      "@type": "Question",
      name: "How do the AI Originality and Plagiarism Source Checks work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The AI Originality Check scans each sentence for patterns common in AI-generated text and returns a percentage score with sentence-level highlights. The Plagiarism Source Check compares your content against published sources and shows you direct links to matches. Both provide sentence-level detail on exactly what to fix.",
      },
    },
    {
      "@type": "Question",
      name: "Does DocAuditor change or rewrite my content?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. DocAuditor flags issues and tells you what to look at. You decide what to change. Your words stay yours.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free version?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The free plan gives you 3 AI Originality checks per month on documents up to 1,000 words. No credit card required. For more usage, buy credits as needed starting from $5 (they never expire), or subscribe for $9.50/month for the best value with 40,000 monthly credits.",
      },
    },
    {
      "@type": "Question",
      name: "Who is DocAuditor for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anyone who submits written work for review. Students use it for essays and theses. Researchers use it for journal articles and grant proposals. Professionals use it for proposals, reports, and client deliverables. Teams use it to quality-check work before it goes out.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a check take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most checks return results in under 5 minutes. You can then fix flagged issues in the integrated editor and recheck to confirm they are resolved.",
      },
    },
    {
      "@type": "Question",
      name: "Do credits expire?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Purchased credits never expire. Use them whenever you are ready. Subscription users get 40,000 credits refreshed monthly.",
      },
    },
  ],
};

const Page = () => {
  return <HomePageWrapper />;
};

export default Page;

Page.getLayout = function PageLayout(page: React.ReactNode) {
  return (
    <PublicLayout>
      <CustomHead
        title={site?.title}
        description={site?.description}
        url={site?.url}
        canonicalUrl={site?.url}
        jsonLd={faqJsonLd}
      />
      {page}
    </PublicLayout>
  );
};

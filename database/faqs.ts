export interface FaqProps {
  id: string;
  title: string;
  answer: string;
}

export const questions: FaqProps[] = [
  {
    id: "what-does-alignment-brief-check-do",
    title: "What does the Alignment Brief Check do?",
    answer:
      "It compares your document against the original instructions, rubric, or project brief. You get a list of every requirement that is met and every one that is missing, so you can fix gaps before submission.",
  },
  {
    id: "how-do-ai-and-plagiarism-checks-work",
    title: "How do the AI Originality and Plagiarism Source Checks work?",
    answer:
      "The AI Originality Check scans each sentence for patterns common in AI-generated text. The Plagiarism Source Check compares your content against published sources and shows you direct links to matches. Both give you sentence-level detail.",
  },
  {
    id: "does-alphadrafts-change-my-content",
    title: "Does AlphaDrafts change or rewrite my content?",
    answer:
      "No. We flag issues and tell you what to look at. You decide what to change. Your words stay yours.",
  },
  {
    id: "what-do-i-get-after-a-check",
    title: "What do I get after a check?",
    answer:
      "A full verification report with scores for each check type, color-coded highlights in your document, and a prioritized list of what to fix first.",
  },
  {
    id: "who-is-alphadrafts-for",
    title: "Who is AlphaDrafts for?",
    answer:
      "Anyone who submits written work for review. Students use it for essays and theses. Professionals use it for proposals, reports, and grant applications. Teams use it to quality-check deliverables before they go out.",
  },
  {
    id: "can-i-cancel-anytime",
    title: "Can I cancel anytime?",
    answer:
      "Yes. Subscriptions can be canceled at any time with no questions asked. Credits you have already purchased never expire.",
  },
];

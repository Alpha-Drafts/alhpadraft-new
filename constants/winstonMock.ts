/**
 * Mock responses for Winston.ai API (development only).
 * Set USE_WINSTON_MOCK=true in .env to avoid deducting credits.
 */

import type {
  WinstonAIDetectionResponse,
  WinstonPlagiarismResponse,
} from "@/types";

/** Sample AI detection response (passes plagiarism sample text). */
export const MOCK_AI_DETECTION_RESPONSE: WinstonAIDetectionResponse = {
  status: 200,
  score: 7.05,
  length: 2336,
  sentences: [
    {
      text: "<p>Artificial Intelligence and Machine Learning have been a long-standing aspiration for me since I was first introduced to coding at university.</p>",
      score: 25.4,
      length: 145,
    },
    {
      text: '<mark class="citation-issue-high" data-issue-type="missing_citation" data-severity="high" data-confidence="0.88">That early curiosity grew into a clear passion and led me to build my final-year project: a face detection and recognition attendance system using Python and OpenCV.</mark> <mark class="citation-issue-medium" data-issue-type="incorrect_format" data-severity="medium" data-confidence="0.74">That experience showed me the power of intelligent systems to solve real-world problems and sparked a desire to build technology that truly matters.</mark></p><p>As my professional career began, I took a different technical path while working with Andela clients, gaining valuable industry experience across other stacks.</p>',
      score: 2.5,
      length: 725,
    },
    {
      text: "Even then, my interest in AI never faded. I continued exploring AI through side projects and self-learning, driven by a deep conviction that this is where I ultimately belong.</p><p></p><p>This opportunity comes at a defining moment in my career.</p>",
      score: 1.04,
      length: 247,
    },
    {
      text: '<mark data-score="100" data-bg-color="rgba(239, 68, 68, 0.4)" data-ai-highlight="" class="ai-highlight" style="background-color: rgba(239, 68, 68, 0.2); color: inherit; padding: 1px 2px; border-radius: 2px; position: relative;">Having recently completed my engagement with an Andela client, I am intentionally realigning my path toward what I am most passionate about.</mark> The Andela AI Engineering Bootcamp represents more than just a learning opportunity—it is a bridge between the foundation I have built and the future I am committed to creating.</p><p>I do not simply want to learn AI; I want to master it and use it as a tool for meaningful innovation.</p>',
      score: 3,
      length: 662,
    },
    {
      text: '<mark data-score="100" data-bg-color="rgba(239, 68, 68, 0.4)" data-ai-highlight="" class="ai-highlight" style="background-color: rgba(239, 68, 68, 0.2); color: inherit; padding: 1px 2px; border-radius: 2px; position: relative;">My goal is to build intelligent solutions that improve lives, empower communities, and create lasting impact.</mark> I believe this bootcamp will equip me with the skills, mindset, and network to turn that vision into reality and take a decisive step toward becoming an AI engineer who builds for purpose, not just progress.</p>',
      score: 22.67,
      length: 557,
    },
  ],
  input: "text",
  attack_detected: {
    zero_width_space: false,
    homoglyph_attack: false,
  },
  readability_score: 36.64,
  credits_used: 0,
  credits_remaining: 9999,
  version: "4.13",
  language: "en",
};

/** Plagiarism mock: no sources (pass). */
export const MOCK_PLAGIARISM_PASS_RESPONSE: WinstonPlagiarismResponse = {
  status: 200,
  scanInformation: {
    service: "plagiarism",
    scanTime: new Date().toISOString(),
    inputType: "text",
    language: "en",
  },
  result: {
    score: 0,
    sourceCounts: 0,
    textWordCounts: 392,
    totalPlagiarismWords: 0,
    identicalWordCounts: 0,
    similarWordCounts: 0,
  },
  sources: [],
  similarWords: [],
  indexes: [],
  citations: [],
  attackDetected: {
    zero_width_space: false,
    homoglyph_attack: false,
  },
  text: "",
  credits_used: 0,
  credits_remaining: 9999,
};

/** Plagiarism mock: detected sources (fail). Use mockPlagiarismFail: true in request body to get this. */
export const MOCK_PLAGIARISM_FAIL_RESPONSE: WinstonPlagiarismResponse = {
  status: 200,
  scanInformation: {
    service: "plagiarism",
    scanTime: new Date().toISOString(),
    inputType: "text",
    language: "en",
  },
  result: {
    score: 42,
    sourceCounts: 2,
    textWordCounts: 392,
    totalPlagiarismWords: 87,
    identicalWordCounts: 65,
    similarWordCounts: 22,
  },
  sources: [
    {
      score: 78,
      canAccess: true,
      url: "https://example.com/article-about-ai",
      title: "AI and Machine Learning in Education",
      plagiarismWords: 52,
      identicalWordCounts: 40,
      similarWordCounts: 12,
      totalNumberOfWords: 1200,
      source: "web",
      citation: false,
      plagiarismFound: [
        {
          startIndex: 0,
          endIndex: 102,
          sequence:
            "Artificial Intelligence and Machine Learning have been a long-standing aspiration for me since I was first introduced to coding at university.",
        },
      ],
    },
    {
      score: 65,
      canAccess: true,
      url: "https://example.com/career-essay",
      title: "Career Goals in Technology",
      plagiarismWords: 35,
      identicalWordCounts: 25,
      similarWordCounts: 10,
      totalNumberOfWords: 800,
      source: "web",
      citation: false,
      plagiarismFound: [
        {
          startIndex: 450,
          endIndex: 512,
          sequence:
            "My goal is to build intelligent solutions that improve lives, empower communities.",
        },
      ],
    },
  ],
  similarWords: [],
  indexes: [
    {
      startIndex: 0,
      endIndex: 102,
      sequence:
        "Artificial Intelligence and Machine Learning have been a long-standing aspiration for me since I was first introduced to coding at university.",
    },
    {
      startIndex: 450,
      endIndex: 512,
      sequence:
        "My goal is to build intelligent solutions that improve lives, empower communities.",
    },
  ],
  citations: [],
  attackDetected: {
    zero_width_space: false,
    homoglyph_attack: false,
  },
  text: "",
  credits_used: 0,
  credits_remaining: 9999,
};

export const USE_WINSTON_MOCK =
  process.env.NODE_ENV !== "production" &&
  process.env.USE_WINSTON_MOCK === "false";

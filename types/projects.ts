import { PROJECT_STATUS_OPTIONS, PROJECT_TYPES } from "@/constants";
import { ApiTimestamp } from "./dates";
import type {
  WinstonAIDetectionResponse,
  WinstonPlagiarismResponse,
} from "./winston";

export type ProjectStatusType = (typeof PROJECT_STATUS_OPTIONS)[number];
export type ProjectTypeType = (typeof PROJECT_TYPES)[number];

export interface ProjectCreateProps {
  name: string;
  description: string;
  content: string;
  type: ProjectTypeType;
  dueDate: string | ApiTimestamp | null;
}

export interface ProjectProps extends ProjectCreateProps {
  id: string;
  userId: string;
  progress: number;
  status: ProjectStatusType;
  stage: number;
  rating: number;
  instructionText?: string;
  analysisResultId?: string;
  instructionStatus?: string;
  aiDetectionResult?: WinstonAIDetectionResponse;
  plagiarismResult?: WinstonPlagiarismResponse;
  evaluation?: EvaluationProps;
  evaluationResultId?: string;
  createdAt: ApiTimestamp;
  updatedAt: ApiTimestamp;
}

export interface ProjectHistoryProps {
  data: ProjectProps[];
  totalCount: number;
}

// Project metrics returned from /v1/projects/metrics
export interface ProjectMetricsProps {
  totalProjects: number;
  draftProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  archivedProjects: number;
}

// Instruction Analysis Types
export interface InstructionCreateProps {
  textContent: string;
  projectId: string;
}

export interface InstructionAnalysisProps {
  id: string;
  projectId: string;
  userId: string;
  textContent: string;
  status: string;
  createdAt: ApiTimestamp;
  updatedAt: ApiTimestamp;
  projectOverview: {
    name: string;
    description: string;
    type: string;
    dueDate: string;
  };
  targetMetrics: {
    tone: string;
    wordLength: string;
    readingLevel: string;
    sourcesNeeded: string;
    citationFormat: string;
  };
  successCriteria: string[];
  structureGuidance: {
    goal: string;
    sections: Array<{
      title: string;
      description: string;
      tips: string[];
    }>;
  };
  writingTips: Array<{
    content?: string[];
    style?: string[];
    organization?: string[];
  }>;
  assumptions: string[];
  tips?: string[];
  rawResponse?: string;
}

export interface PostProps {
  id: string;
  projectId: string;
  userId: string;
  textContent: string;
  status: string;
  createdAt: ApiTimestamp;
  updatedAt: ApiTimestamp;
}

export interface EvaluationProps {
  id: string;
  overallScore: number;
  grade: string;
  contentQuality: {
    score: number;
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
  };
  writingAnalysis: {
    summary?: string;
    clarity: number;
    coherence: number;
    style: number;
  };
  structure: {
    score: number;
    organization: string;
    flow: string;
    suggestions: string[];
  };
  researchQuality: {
    score: number;
    citations: number;
    sourceReliability: number;
    evidenceStrength: number;
  };
  successCriteriaAssessment?: Array<{
    criteria: string;
    assessment: string;
  }>;
  finalRecommendations: {
    priorityActions: string[];
    nextSteps: string[];
    finalVerdict?: {
      verdict: string;
      reason: string;
    };
  };
  postId?: string;
  projectId: string;
  userId: string;
  createdAt: ApiTimestamp;
  updatedAt: ApiTimestamp;
}

export interface AccountStatistics {
  memberSince: string;
  totalAnalysisResult: number;
  totalEvaluations: number;
  totalProjects: number;
  totalAnalysisResults: number;
  totalWordsWritten: number;
}

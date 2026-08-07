import { API_BASE_URL } from "@/constants";
import { apiClient } from "..";
import {
  CitationAnalysisResponseProps,
  CitationAnalyzeRequestProps,
  CitationStyleType,
} from "@/types";

/**
 * Real-time citation checking for text content
 * @param projectId - The ID of the project
 * @param text - The text content to check
 * @param citationFormat - The citation format (APA, MLA, etc.)
 */
export const checkCitations = async (
  projectId: string,
  text: string,
  citationFormat: CitationStyleType,
): Promise<CitationAnalysisResponseProps> => {
  const params = new URLSearchParams();
  params.append("citationFormat", citationFormat);

  const response = await apiClient.post<CitationAnalysisResponseProps>(
    `${API_BASE_URL}/v1/projects/${projectId}/posts/check-citation?${params.toString()}`,
    text,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    },
  );

  return response.data;
};

/**
 * Analyze citations in a saved post
 * @param projectId - The ID of the project
 * @param postId - The ID of the post
 * @param citationFormat - The citation format (APA, MLA, etc.)
 */
export const analyzeCitations = async (
  projectId: string,
  postId: string,
  citationFormat: CitationStyleType,
): Promise<CitationAnalysisResponseProps> => {
  const data: CitationAnalyzeRequestProps = {
    citationFormat,
  };

  const response = await apiClient.post<CitationAnalysisResponseProps>(
    `${API_BASE_URL}/v1/projects/${projectId}/posts/${postId}/citations/analyze`,
    data,
  );

  return response.data;
};

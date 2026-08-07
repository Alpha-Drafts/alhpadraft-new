import { userRoutes } from "@/constants";

// Reusable function to get project redirect URL
export function getProjectRedirectUrl(stage: number, id: string): string {
  if (!userRoutes) return "/dashboard";
  if (!id) return userRoutes?.projects || "/dashboard/projects";

  const safeStage = Math.max(1, Number(stage) || 1);

  switch (safeStage) {
    case 1:
      return `${userRoutes?.project_new}/${id}`;
    case 2:
      return `${userRoutes?.project_new}/${id}?step=analyse`;
    case 3:
    case 4:
    case 5:
      return `${userRoutes?.project_draft}/${id}`;
    default:
      return `${userRoutes?.project_new}/${id}`;
  }
}

// Converts a URL-friendly slug back to a product name and id, e.g., "product-name-123" becomes ["product name", "123"]
export const extractProductId = (slug: string): string => {
  const decodedSlug = decodeURIComponent(slug);
  const parts = decodedSlug.split("-");
  return parts[parts.length - 1];
};

// Strips HTML tags from a string and trims whitespace
export const stripHtmlTags = (input: string): string => {
  return input.replace(/<[^>]*>/g, "").trim();
};

/**
 * @description
 * This file defines route constants for various sections of the website, making it easier to manage and reference URLs throughout the application.
 * Example: `publicRoutes` groups all public routes related to the main website, while `authRoutes` contains routes for authentication-related pages.
 * This structure helps in maintaining a clean and organized codebase, especially in larger applications where routes can become complex.
 */

export const publicRoutes: Record<string, string> = {
  home: "/",
  about: "/#features",
  features: "/#features",
  how_it_works: "/#how-it-works",
  pricing: "/#pricing",
  contact: "#",
  help: "#",
  careers: "#",
  privacy: "/privacy",
  terms: "/terms",
  unauthorised: "/unauthorised",
};

export const authRoutes: Record<string, string> = {
  auth: "/auth",
  signup: "/?auth=signup",
  login: "/?auth=login",
  forgot_password: "/?auth=forgot-password",
  reset_password: "/auth/reset-password",
};

export const userRoutes: Record<string, string> = {
  dashboard: "/dashboard",
  projects: "/dashboard/projects",
  project_new: "/dashboard/projects/new",
  project_draft: "/dashboard/projects/draft",
  settings: "/dashboard/settings",
};

import { NotificationEventType, NotificationMessageProps } from "@/types";
import { userRoutes } from "./routes";

import { UserCircle, Settings, Megaphone } from "lucide-react";
import React from "react";
import { USER_ROLES } from "./users";

export const NOTIFICATION_CATEGORIES = [
  "account",
  "system",
  "announcement",
] as const;

export const NOTIFICATION_CATEGORY_ICONS: Record<
  (typeof NOTIFICATION_CATEGORIES)[number],
  React.ComponentType
> = {
  account: UserCircle,
  system: Settings,
  announcement: Megaphone,
};

export const NOTIFICATIONS_STATUS = ["unread", "read"] as const;

export const NOTIFICATION_EVENTS = [
  // Account events
  "ACCOUNT_CREATED",
  "PROFILE_UPDATED",
  "PASSWORD_CHANGED",
  "EMAIL_CHANGED",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_REACTIVATED",
  // System events
  "MAINTENANCE_ALERT",
  "SECURITY_ALERT",
  "SYSTEM_UPDATE",
  "BACKUP_COMPLETED",
  "SERVICE_OUTAGE",
  // Announcement events
  "PLATFORM_ANNOUNCEMENT",
  "NEW_FEATURE",
  "POLICY_UPDATE",
] as const;

export const NOTIFICATIONS_AUDIENCES = ["all", ...USER_ROLES] as const;

export const NOTIFICATIONS_STATUSES = ["unread", "read"] as const;

export const NOTIFICATION_MESSAGES: Record<
  NotificationEventType,
  NotificationMessageProps
> = {
  // Account templates
  ACCOUNT_CREATED: {
    title: "Welcome to Startr360",
    message:
      "Your account has been successfully created. Let's get you started on your startup journey.",
    action: {
      text: "Complete Profile",
      href: `${userRoutes?.dashboard}`,
    },
  },
  PROFILE_UPDATED: {
    title: "Profile Updated",
    message: "Your profile has been successfully updated.",
    action: {
      text: "View Profile",
      href: `${userRoutes?.dashboard}`,
    },
  },
  PASSWORD_CHANGED: {
    title: "Password Changed",
    message: "Your password has been successfully changed for security.",
    action: {
      text: "Account Settings",
      href: `${userRoutes?.dashboard}`,
    },
  },
  EMAIL_CHANGED: {
    title: "Email Address Updated",
    message:
      "Your email address has been successfully updated to {{new_mail}}.",
    action: {
      text: "Account Settings",
      href: `${userRoutes?.dashboard}`,
    },
  },
  ACCOUNT_SUSPENDED: {
    title: "Account Suspended",
    message:
      "Your account has been temporarily suspended. Please contact support for assistance.",
    action: {
      text: "Contact Support",
      href: `${userRoutes?.dashboard}`,
    },
  },
  ACCOUNT_REACTIVATED: {
    title: "Account Reactivated",
    message: "Welcome back! Your account has been successfully reactivated.",
    action: {
      text: "Continue",
      href: `${userRoutes?.dashboard}`,
    },
  },
  // System templates
  MAINTENANCE_ALERT: {
    title: "Scheduled Maintenance",
    message:
      "We'll be undergoing maintenance on {{date}} from {{start_time}} to {{end_time}}. Some features may be temporarily unavailable.",
    action: {
      text: "Learn More",
      href: `${userRoutes?.dashboard}`,
    },
  },
  SECURITY_ALERT: {
    title: "Security Alert",
    message:
      "We noticed a login from a new device or location. If this wasn't you, please secure your account immediately.",
    action: {
      text: "Secure Account",
      href: `${userRoutes?.dashboard}`,
    },
  },
  SYSTEM_UPDATE: {
    title: "System Update",
    message:
      "Our platform has been updated with new features and improvements. {{update_details}}",
    action: {
      text: "View Changes",
      href: `${userRoutes?.dashboard}`,
    },
  },
  BACKUP_COMPLETED: {
    title: "Backup Completed",
    message: "Your data backup has been completed successfully on {{date}}.",
    action: {
      text: "View Details",
      href: `${userRoutes?.dashboard}`,
    },
  },
  SERVICE_OUTAGE: {
    title: "Service Outage",
    message:
      "We're experiencing technical difficulties. Our team is working to restore services. Estimated resolution: {{estimated_time}}.",
    action: {
      text: "Status Page",
      href: `${userRoutes?.dashboard}`,
    },
  },
  // Announcement templates
  PLATFORM_ANNOUNCEMENT: {
    title: "Important Announcement",
    message: "{{announcement_text}}",
    action: {
      text: "Read More",
      href: `${userRoutes?.dashboard}`,
    },
  },
  NEW_FEATURE: {
    title: "New Feature Available",
    message:
      "We've added a new feature: {{feature_name}}. {{feature_description}}",
    action: {
      text: "Try Now",
      href: `${userRoutes?.dashboard}`,
    },
  },
  POLICY_UPDATE: {
    title: "Policy Update",
    message:
      "Our {{policy_type}} has been updated. Please review the changes that take effect on {{effective_date}}.",
    action: {
      text: "Review Policy",
      href: `${userRoutes?.dashboard}`,
    },
  },
};

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_EVENTS,
  NOTIFICATIONS_STATUS,
  NOTIFICATIONS_AUDIENCES,
} from "@/constants";
import { ApiTimestamp } from "./dates";

export type NotificationCategoryType = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationEventType = (typeof NOTIFICATION_EVENTS)[number];

export type NotificationAudienceType = (typeof NOTIFICATIONS_AUDIENCES)[number];

export type NotificationStatusType = (typeof NOTIFICATIONS_STATUS)[number];

/** 🔹 Notification Payload for Creation */
export type NotificationMetaDataProps = {
  new_mail?: string;
  plan_name?: string;
  plan_id?: string;
  subscription_id?: string;
  subscriber_name?: string;
  subscriber_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  update_details?: string;
  estimated_time?: string;
  announcement_text?: string;
  feature_name?: string;
  feature_description?: string;
  policy_type?: string;
  effective_date?: string;
};

export interface CreateNotificationProps {
  user_id?: string; // Who will receive the notification. Required for user specific notifications.
  category: NotificationCategoryType;
  event: NotificationEventType;
  audience: NotificationAudienceType;
  metadata: NotificationMetaDataProps;
  channel: {
    in_app: boolean;
    email: boolean;
  };
}

/** 🔹 Full Notification Document */
export interface NotificationProps extends CreateNotificationProps {
  id: string;
  read: NotificationStatusType;
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
}

export interface NotificationHistoryProps {
  data: NotificationProps[];
  total_count: number;
}

export interface NotificationCountProps {
  total_count: number;
  unread_count: number;
}

export type NotificationMessageProps = {
  title: string;
  message: string;
  action?: {
    text: string;
    href: string;
  };
};

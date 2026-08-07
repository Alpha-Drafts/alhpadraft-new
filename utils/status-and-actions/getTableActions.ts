import { TableActionItem } from "@/types";

export const getAdminActions = (
  isSuperAdmin: boolean,
  actionHandlers: {
    onRemoveAdminDetails: () => void;
  },
): { items: TableActionItem[] } => {
  const items: TableActionItem[] = [];

  if (isSuperAdmin) {
    items.push({
      label: "Remove Admin",
      action: actionHandlers.onRemoveAdminDetails,
    });
  }

  return { items };
};

export const getUserActions = (
  role: string,
  actionHandlers: {
    onViewDetails: () => void;
    onContact: () => void;
    onDisable: () => void;
    onBan: () => void;
    onDelete: () => void;
  },
): { items: TableActionItem[] } => {
  const items: TableActionItem[] = [];

  items.push({
    label: "View Details",
    action: actionHandlers.onViewDetails,
  });

  items.push({
    label: "Contact",
    action: actionHandlers.onContact,
  });

  items.push({
    label: "Disable",
    action: actionHandlers.onDisable,
  });

  items.push({
    label: "Ban",
    action: actionHandlers.onBan,
  });

  if (role === "super_admin") {
    items.push({
      label: "Delete",
      action: actionHandlers.onDelete,
    });
  }

  return { items };
};

export const getInvoiceActions = (actionHandlers: {
  onViewDetails: () => void;
  onContact: () => void;
}): { items: TableActionItem[] } => {
  const items: TableActionItem[] = [];

  items.push({
    label: "View Details",
    action: actionHandlers.onViewDetails,
  });

  items.push({
    label: "Contact User",
    action: actionHandlers.onContact,
  });

  return { items };
};

export const getSubscriptionActions = (actionHandlers: {
  onViewDetails: () => void;
}): { items: TableActionItem[] } => {
  const items: TableActionItem[] = [];

  items.push({
    label: "View Details",
    action: actionHandlers.onViewDetails,
  });
  return { items };
};

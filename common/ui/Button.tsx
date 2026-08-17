import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { ButtonProps } from "@/types";

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "py-2 px-3 text-xs",
  md: "py-3 px-4 text-sm",
  lg: "py-4 px-6 text-base",
};

const roundedClasses: Record<NonNullable<ButtonProps["rounded"]>, string> = {
  sm: "rounded-[6px]",
  md: "rounded-[var(--radius-button)]",
  lg: "rounded-[var(--radius-card)]",
  full: "rounded-[var(--radius-pill)] aspect-square",
};

const baseClasses =
  "inline-flex items-center gap-x-2 font-medium transition-all disabled:opacity-50 disabled:pointer-events-none group";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-none text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]",
  secondary:
    "border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
  outline:
    "border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
  plain:
    "border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
  danger:
    "border border-transparent text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)] focus-visible:ring-offset-2",
  link: "border border-transparent !p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
};

const variantStyles: Record<
  NonNullable<ButtonProps["variant"]>,
  React.CSSProperties
> = {
  primary: {
    background:
      "linear-gradient(109.37deg, var(--color-primary) 0%, var(--color-primary-hover) 50%, var(--color-primary-active) 100%)",
  },
  secondary: {
    borderColor: "var(--color-border-medium)",
    backgroundColor: "var(--color-surface-container)",
    color: "var(--color-text-primary)",
  },
  outline: {
    borderColor: "var(--color-primary)",
    backgroundColor: "transparent",
    color: "var(--color-primary)",
  },
  plain: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: "var(--color-text-primary)",
  },
  danger: {
    borderColor: "transparent",
    backgroundColor: "var(--color-error)",
    color: "var(--color-on-primary)",
  },
  link: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: "var(--color-primary)",
    padding: 0,
  },
};

const variantHoverStyles: Record<
  NonNullable<ButtonProps["variant"]>,
  React.CSSProperties | undefined
> = {
  primary: {
    backgroundColor: "var(--color-primary-hover)",
  },
  secondary: {
    backgroundColor: "var(--color-primary-container)",
    borderColor: "var(--color-primary)",
  },
  outline: {
    backgroundColor: "var(--color-primary-container)",
    borderColor: "var(--color-primary-hover)",
    color: "var(--color-primary-hover)",
  },
  plain: {
    backgroundColor: "rgba(26, 115, 232, 0.06)",
    color: "var(--color-primary-hover)",
  },
  danger: {
    backgroundColor: "var(--color-primary-active)",
  },
  link: {
    color: "var(--color-primary-hover)",
  },
};

export function Button({
  text,
  id,
  type = "button",
  className = "",
  onClick,
  disabled = false,
  hidden = false,
  children,
  link,
  title,
  icon,
  iconPosition = "left",
  variant = "primary",
  size = "md",
  rounded = "md",
  ...props
}: ButtonProps) {
  if (hidden) return null;

  const content = (
    <span
      className={`mx-auto ${icon ? "inline-flex items-center justify-center gap-1 whitespace-nowrap transition-all" : ""}`}
    >
      {icon && iconPosition === "left" && (
        <span className={children ? "mr-2" : ""}>{icon}</span>
      )}
      {text ?? children}
      {icon && iconPosition === "right" && (
        <span className={children ? "ml-2" : ""}>{icon}</span>
      )}
    </span>
  );

  const buttonClass = clsx(
    baseClasses,
    sizeClasses[size || "md"],
    roundedClasses[rounded || "md"],
    variantClasses[variant],
    className,
  );

  const mergedStyle: React.CSSProperties = {
    ...variantStyles[variant],
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const hover = variantHoverStyles[variant];
    if (hover) Object.assign(e.currentTarget.style, hover);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const hover = variantHoverStyles[variant];
    if (hover) {
      Object.keys(hover).forEach(key => {
        const k = key as keyof React.CSSProperties;
        // @ts-expect-error reset to base style
        e.currentTarget.style[k] = mergedStyle[k] || "";
      });
    }
  };

  if (link) {
    return (
      <Link
        href={link}
        id={id}
        className={buttonClass}
        style={mergedStyle}
        title={title}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
      style={mergedStyle}
      title={title}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {content}
    </button>
  );
}

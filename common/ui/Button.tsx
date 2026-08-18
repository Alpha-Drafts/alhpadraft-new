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
    "border-none text-white bg-[linear-gradient(109.37deg,var(--color-primary)_0%,var(--color-primary-hover)_50%,var(--color-primary-active)_100%)] hover:bg-[linear-gradient(109.37deg,var(--color-primary-hover)_0%,var(--color-primary-active)_50%,var(--color-primary-active)_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]",
  secondary:
    "border border-[var(--color-border-medium)] bg-[var(--color-surface-container)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary-container)] hover:border-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
  outline:
    "border border-[var(--color-primary)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
  plain:
    "border border-transparent bg-transparent text-[var(--color-text-primary)] hover:bg-[rgba(26,115,232,0.06)] hover:text-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
  danger:
    "border border-transparent bg-[var(--color-error)] text-[var(--color-on-primary)] hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)] focus-visible:ring-offset-2",
  link: "border border-transparent bg-transparent text-[var(--color-primary)] !p-0 hover:text-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
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

  const { style: externalStyle, ...restProps } = props;

  if (link) {
    return (
      <Link
        href={link}
        id={id}
        className={buttonClass}
        style={externalStyle as React.CSSProperties}
        title={title}
      {...restProps}
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
      style={externalStyle as React.CSSProperties}
      title={title}
      {...restProps}
    >
      {content}
    </button>
  );
}

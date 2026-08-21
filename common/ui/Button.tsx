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
  "inline-flex items-center gap-x-2 font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:opacity-50 disabled:pointer-events-none group";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-none text-[var(--color-on-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-px hover:shadow-[var(--elevation-1)] active:bg-[var(--color-primary-active)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shadow-[var(--elevation-0)]",
  secondary:
    "border-[1.5px] border-[var(--color-border-medium)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-primary-container)] hover:border-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shadow-none",
  outline:
    "border border-[var(--color-primary)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shadow-none",
  plain:
    "border border-transparent bg-transparent text-[var(--color-primary)] hover:bg-[rgba(26,115,232,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shadow-none",
  danger:
    "border border-transparent bg-[var(--color-error)] text-[var(--color-on-primary)] hover:bg-[var(--color-on-error-container)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)] focus-visible:ring-offset-2 shadow-none",
  link: "border border-transparent bg-transparent text-[var(--color-primary)] !p-0 hover:text-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] shadow-none",
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

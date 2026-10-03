import React from "react";

/**
 * Reusable Button Component
 */
export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  icon: Icon,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn-custom btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {Icon && <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} className="btn-icon" />}
      <span>{children}</span>
    </button>
  );
}

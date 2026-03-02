import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline";
type ButtonSize = "default" | "sm" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[#D6F0D6] text-[#111] border border-[#b9dfb9] hover:bg-[#c8e9c8] focus-visible:ring-[#D6F0D6]/60",
  secondary:
    "bg-white text-[#111] border border-black/10 hover:bg-black/[0.02] focus-visible:ring-black/10",
  ghost:
    "bg-transparent text-[#111] hover:bg-black/[0.04] focus-visible:ring-black/10",
  outline:
    "bg-transparent border border-black/15 text-[#111] hover:bg-black/[0.03] focus-visible:ring-black/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

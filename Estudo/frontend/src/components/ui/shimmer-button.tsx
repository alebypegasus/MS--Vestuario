import React from "react";
import { cn } from "../../utils/cn";

export const ShimmerButton = ({
  children,
  className,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 animate-shimmer items-center justify-center rounded-xl border border-slate-700 bg-[linear-gradient(110deg,#0f172a,45%,#312e81,55%,#0f172a)] bg-[length:200%_100%] px-6 font-bold text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none text-sm uppercase tracking-wider shadow-glow-indigo",
        className
      )}
    >
      {children}
    </button>
  );
};

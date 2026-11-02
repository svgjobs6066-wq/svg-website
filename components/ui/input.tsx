import * as React from "react";
import { cn } from "@/lib/utils";
export const fieldClass =
  "flex min-h-12 w-full rounded-xs border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink/35 hover:border-ink/30 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 disabled:opacity-50 aria-invalid:border-red-600";
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldClass, className)} {...props} />;
}
export function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return <select className={cn(fieldClass, className)} {...props} />;
}

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
export const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-between gap-6 rounded-xs py-3 pl-5 pr-4 text-sm font-semibold tracking-tight transition-[background-color,color,border-color,scale] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange active:not-disabled:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-blue text-white hover:bg-brand-blue-deep",
        outline:
          "border border-ink/20 bg-white text-ink hover:border-brand-blue hover:text-brand-blue",
        orange: "bg-brand-orange text-ink hover:bg-brand-orange-soft",
        light: "bg-white text-brand-blue hover:bg-brand-blue-soft",
        ghost: "text-ink hover:bg-paper",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-magnetic
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}

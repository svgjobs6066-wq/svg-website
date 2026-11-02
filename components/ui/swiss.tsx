import { cn } from "@/lib/utils";

/** Page-width wrapper shared by every public section. */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-2xl px-4 md:px-8 xl:px-12",
        className,
      )}
      {...props}
    />
  );
}

/** Swiss section label: a short rule, then a mono caption. */
export function Eyebrow({
  className,
  tone = "blue",
  children,
}: {
  className?: string;
  tone?: "blue" | "light" | "orange";
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
        tone === "blue" && "text-brand-blue",
        tone === "light" && "text-white/75",
        tone === "orange" && "text-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-0.5 w-7 shrink-0",
          tone === "light" ? "bg-white" : "bg-brand-orange",
          tone === "orange" && "bg-ink",
        )}
      />
      {children}
    </p>
  );
}

/** Small mono index such as "01" used in tables and cards. */
export function Index({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("font-mono text-[11px] tabular-nums", className)}
    >
      {String(value).padStart(2, "0")}
    </span>
  );
}

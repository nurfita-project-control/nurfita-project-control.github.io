import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-white px-2", className)}
      aria-label="PT Nurfita Karya Mandiri"
      data-priority={priority ? "true" : undefined}
    >
      <span className="font-serif text-sm font-bold tracking-tight text-[#0e1111]">NK</span>
    </span>
  );
}

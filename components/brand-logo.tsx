import Image from "next/image";
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
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
      aria-label="PT Nurfita Karya Mandiri"
    >
      <Image
        src="/nurfita-logo.png"
        alt="PT Nurfita Karya Mandiri"
        fill
        sizes="(max-width: 640px) 72px, 112px"
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}

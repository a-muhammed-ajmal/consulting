import Image from "next/image";
import { cn } from "@/lib/utils";

/* Trimmed to its ink. The 640x216 original carried 53px of transparent padding
   above the mark and 46px below, so 46% of any rendered height was empty air
   and the wordmark read far smaller than the 16px nav links beside it. */
const LOCKUP_PATH = "/logos/muhammedajmalcom-lockup-trimmed.png";
const MARK_PATH = "/logos/muhammedajmalcom-mark-512.png";

interface BrandLogoProps {
  readonly alt?: string;
  readonly className?: string;
  readonly eager?: boolean;
  readonly sizes?: string;
}

export function BrandLockup({
  alt = "Muhammed Ajmal Consulting",
  className,
  eager = false,
  sizes = "(min-width: 1280px) 205px, (min-width: 1024px) 148px, (min-width: 640px) 186px, 148px",
}: BrandLogoProps) {
  return (
    <Image
      src={LOCKUP_PATH}
      alt={alt}
      width={577}
      height={125}
      sizes={sizes}
      className={cn("h-auto w-auto object-contain", className)}
      loading={eager ? "eager" : undefined}
    />
  );
}

export function BrandMark({
  alt = "",
  className,
  eager = false,
  sizes = "56px",
}: BrandLogoProps) {
  return (
    <Image
      src={MARK_PATH}
      alt={alt}
      width={512}
      height={512}
      sizes={sizes}
      className={cn("h-auto w-auto object-contain", className)}
      loading={eager ? "eager" : undefined}
    />
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

const LOCKUP_PATH = "/logos/muhammedajmalcom-lockup-640.png";
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
  sizes = "(min-width: 640px) 131px, 119px",
}: BrandLogoProps) {
  return (
    <Image
      src={LOCKUP_PATH}
      alt={alt}
      width={640}
      height={216}
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

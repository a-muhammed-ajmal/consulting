"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BrandLockup } from "@/components/layout/BrandLogo";

const navLinks = [
  { href: "/#founder-trap", label: "Founder Trap" },
  { href: "/services", label: "How It Works" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Whether a nav link points at the page currently being viewed.
 *
 * Hash links ("/#founder-trap") are sections of the homepage, not routes, so they are
 * never marked current — the section a visitor happens to be scrolled to is not a
 * navigation state. /insights matches its article and category children.
 */
function isCurrent(pathname: string | null, href: string): boolean {
  if (!pathname || href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isDiagnostic = pathname?.startsWith("/diagnostic");
  const isResults = pathname?.startsWith("/results");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAdmin || isDiagnostic) return null;

  return (
    <nav className={cn("sticky top-0 z-50 border-b border-line bg-white/80 px-4 py-3 text-ink backdrop-blur-md backdrop-saturate-150 transition-all duration-200 md:px-6", scrolled && "border-line-strong shadow-2")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex min-h-[44px] items-center transition-opacity hover:opacity-90">
          <BrandLockup className="h-10 sm:h-11" eager />
        </Link>

        <div className="hidden gap-6 font-body text-[length:var(--step-0)] font-medium tracking-wide lg:flex">
          {navLinks.map((link) => {
            const isActive = isCurrent(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn("group relative transition-colors duration-200 hover:text-brand-ink", isActive && "text-brand-ink")}
              >
                {link.label}
                <span className={cn("absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-brand transition-[width] duration-200 group-hover:w-full", isActive ? "w-full" : "w-0")} />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {!isResults && <Button href="/diagnostic" className="hidden px-4 py-2 sm:inline-flex">Start the Business Health Check →</Button>}
          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="tap-target inline-flex items-center justify-center text-ink transition-colors hover:text-brand-ink lg:hidden" aria-label="Toggle menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={cn("overflow-hidden border-t border-line transition-[max-height,opacity,padding] duration-300 ease-in-out lg:hidden", mobileOpen ? "mt-3 max-h-[420px] pb-2 pt-3 opacity-100" : "max-h-0 opacity-0")}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} aria-current={isCurrent(pathname, link.href) ? "page" : undefined} className={cn("block border-b border-line px-2 py-3 font-body text-[length:var(--step-0)] transition-colors hover:text-brand-ink last:border-0", isCurrent(pathname, link.href) && "text-brand-ink")}>
            {link.label}
          </Link>
        ))}
        {!isResults && <Button href="/diagnostic" className="mt-3 w-full" onClick={() => setMobileOpen(false)}>Start the Business Health Check →</Button>}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { Button } from "@/components/ui/Button";
import { BrandLockup } from "@/components/layout/BrandLogo";

const links = [
  { href: "/#founder-trap", label: "Founder Trap" },
  { href: "/services", label: "How It Works" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isDiagnostic = pathname?.startsWith("/diagnostic");

  if (isAdmin || isDiagnostic) return null;

  return (
    <footer className="relative overflow-hidden border-t border-line bg-canvas-light px-6 py-14 text-ink">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="orb orb-electric absolute -right-32 -top-40 h-96 w-96" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Newsletter leads the footer — it is the one conversion left on the page. */}
        <div className="grid gap-8 rounded-2xl border border-line bg-white p-6 shadow-1 md:grid-cols-12 md:items-center md:p-8">
          <div className="md:col-span-5">
            <p className="eyebrow mb-2">Newsletter</p>
            <h2 className="font-heading text-[length:var(--step-1)] font-bold text-ink">Practical operating insight</h2>
            <p className="mt-2 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
              For founder-led UAE SMEs. Sent when there is something worth sending.
            </p>
          </div>
          <div className="md:col-span-7">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <BrandLockup className="w-full max-w-[240px]" sizes="240px" />
            {/* WEB §5 fixes this descriptor word for word, including the location
                clause. It is one sentence, not a descriptor plus a city line. */}
            <p className="mt-4 max-w-xs font-body text-[length:var(--step-0)] leading-relaxed text-muted">
              Business Operations & Growth Consulting for founder-led UAE SMEs, based in Dubai, United Arab Emirates.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="mb-2 font-heading text-xs font-semibold uppercase text-brand-ink">Explore</p>
            <nav aria-label="Footer navigation">
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-[44px] items-center font-body text-[length:var(--step-0)] text-muted transition-colors duration-200 hover:text-brand-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="md:col-span-4">
            <p className="mb-3 font-heading text-xs font-semibold uppercase text-brand-ink">Start here</p>
            <Button href="/diagnostic">
              Start the Business Health Check
              {/* WEB §5 fixes the label including the arrow. The icon is decorative,
                  so the glyph is restated here for the accessible name only. */}
              <span className="sr-only"> →</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="mt-3 font-body text-xs text-muted">
              Free. Private. A focused founder-dependency self-report.
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center border-t border-line pt-6">
          <p className="font-body text-xs text-muted">
            © {new Date().getFullYear()} Muhammed Ajmal Consulting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

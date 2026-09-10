"use client";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";

/**
 * The error boundary for public route segments. WEB §4 registers it alongside
 * the 404 as a fallback, not a route.
 *
 * It states that something failed and offers a retry. It does not invent a
 * reason, apologise at length, capture an email, or present an offer — the
 * cause is not known here, and guessing at one would be a claim.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageHero
      eyebrow="Something went wrong"
      tone="tint"
      spokeArc
      title="That didn&rsquo;t load."
      lead="The page failed to render. Trying again often resolves it."
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="quiet">
            Back to home
          </Button>
        </>
      }
    />
  );
}

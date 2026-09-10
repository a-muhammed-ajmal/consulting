'use client';

import { Button } from '@/components/ui/Button';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-light px-4">
      <section role="alert" className="w-full max-w-lg rounded-2xl border border-danger/30 bg-white p-8 shadow-2">
        <p className="eyebrow text-danger">Admin data unavailable</p>
        <h1 className="mt-3 font-heading text-[length:var(--step-3)] font-extrabold text-ink">
          The workspace could not load its records.
        </h1>
        <p className="mt-3 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
          No failed query has been counted as an empty pipeline. Try again, and check the server logs if the problem continues.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/admin" variant="secondary">Back to admin</Button>
        </div>
      </section>
    </div>
  );
}

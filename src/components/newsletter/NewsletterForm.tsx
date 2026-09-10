'use client';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, CircleCheck } from 'lucide-react';

const newsletterSchema = z.object({ email: z.string().email() });
type NewsletterFields = z.infer<typeof newsletterSchema>;

/**
 * Rendered in two places — the /insights section and the site footer. Both now sit on
 * light ground, so the old `tone` prop that inverted the copy for a dark footer is gone.
 *
 * The field id comes from useId() because both instances can appear on the same page —
 * a fixed id would duplicate and leave each <label htmlFor> pointing at the wrong input.
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fieldId = useId();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterFields>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const submit = async ({ email }: NewsletterFields) => {
    setStatus('idle');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // A 200 alone is not proof of subscription: the route returns an explicit
      // success flag, and only that flag means the row was actually written.
      const body = await res.json().catch(() => null);
      if (res.ok && body?.success === true) { setStatus('success'); reset(); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  if (status === 'success') return (
    <div className="rounded-xl border border-success/30 bg-success-soft p-6 text-center">
      <p className="mb-1 flex items-center justify-center gap-2 font-heading text-[length:var(--step-0)] font-bold text-success">
        <CircleCheck className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        You are subscribed.
      </p>
      <p className="font-body text-[length:var(--step-0)] text-muted">You will hear from us when there is something worth sending.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <label htmlFor={fieldId} className="sr-only">Email address</label>
      <input
        id={fieldId}
        type="email"
        {...register('email')}
        required
        placeholder="your@email.com"
        className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-3 text-ink transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-brand"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-6 py-3 font-heading text-[length:var(--step-0)] font-bold text-white transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? 'Subscribing…' : 'Subscribe'}
        {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
      {errors.email && <p role="alert" className="mt-1 w-full text-xs text-danger">Enter a valid email address.</p>}
      {status === 'error' && <p role="alert" className="mt-1 w-full text-xs text-danger">Something went wrong. Try again.</p>}
      <p className="w-full font-body text-xs text-muted sm:basis-full">
        By subscribing you agree to our{' '}
        <a href="/privacy" className="text-brand-ink underline transition-colors hover:text-brand">Privacy Policy</a>.
      </p>
    </form>
  );
}

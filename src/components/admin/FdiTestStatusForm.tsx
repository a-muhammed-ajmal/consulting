'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Field';

const testStatusSchema = z.object({ reason: z.string().max(500) });
type TestStatusFields = z.infer<typeof testStatusSchema>;

interface FdiTestStatusFormProps {
  readonly sessionId: string;
  readonly isTest: boolean;
}

export function FdiTestStatusForm({ sessionId, isTest }: FdiTestStatusFormProps) {
  const [currentValue, setCurrentValue] = useState(isTest);
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TestStatusFields>({
    resolver: zodResolver(testStatusSchema),
    defaultValues: { reason: '' },
  });

  const submit = async ({ reason }: TestStatusFields) => {
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/fdi/sessions/${sessionId}/test-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTest: !currentValue, reason: reason || undefined }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok || !payload || typeof payload !== 'object' || !('success' in payload) || payload.success !== true) {
        throw new Error(payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Unable to update test status.');
      }
      setCurrentValue((value) => !value);
      reset();
      setMessage('Test status updated and recorded in the audit history.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to update test status.');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3">
      <p className="font-body text-[length:var(--step-0)] text-muted">
        Current classification: <strong>{currentValue ? 'Test' : 'Live'}</strong>
      </p>
      <div>
        <Label htmlFor="test-status-reason">Reason <span className="font-normal text-muted">(optional)</span></Label>
        <Input id="test-status-reason" {...register('reason')} invalid={Boolean(errors.reason)} maxLength={500} />
        {errors.reason && <p role="alert" className="mt-1 font-body text-xs text-danger">Reason must be 500 characters or fewer.</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : currentValue ? 'Mark as live' : 'Mark as test'}
      </Button>
      {message && <p role="status" className="font-body text-xs text-muted">{message}</p>}
    </form>
  );
}

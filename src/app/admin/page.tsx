'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Field';
import { BrandMark } from '@/components/layout/BrandLogo';

const adminLoginSchema = z.object({ password: z.string().min(1).max(500) });
type AdminLoginFields = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminLoginFields>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { password: '' },
  });

  const handleLogin = async ({ password }: AdminLoginFields) => {
    setFormError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin/leads');
        return;
      }
      setFormError(res.status === 401
        ? 'Incorrect password. Try again.'
        : 'Admin access is temporarily unavailable. Try again shortly.');
    } catch {
      setFormError('Admin access is temporarily unavailable. Try again shortly.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas-light px-4">
      <div className="glass-panel relative z-10 w-full max-w-sm rounded-2xl p-10">
        <div className="mb-8 text-center">
          <BrandMark alt="Muhammed Ajmal Consulting" className="mx-auto mb-3 h-14 w-14" eager />
          <h1 className="font-heading text-[length:var(--step-1)] font-bold uppercase text-ink">Admin Access</h1>
        </div>
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              {...register('password')}
              invalid={Boolean(errors.password || formError)}
              placeholder="Enter admin password"
              required
            />
          </div>
          {formError && <p role="alert" className="text-danger text-[length:var(--step-0)]">{formError}</p>}
          <Button type="submit" disabled={isSubmitting} fullWidth className="min-h-[48px]">
            {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  );
}

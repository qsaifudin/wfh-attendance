'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck2, Loader2, MapPin, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/use-auth';
import { apiErrorMessage } from '@/lib/api';
import { loginSchema, type LoginFormValues } from '@/schemas/login.schema';
import { DEMO_ACCOUNTS, DEMO_LOGIN_ENABLED, type DemoAccount } from '@/lib/demo-accounts';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const login = useLogin();
  const [activeDemoEmail, setActiveDemoEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => login.mutate(values);

  const handleDemoClick = (account: DemoAccount) => {
    setValue('email', account.email);
    setValue('password', account.password);
    setActiveDemoEmail(account.email);
    login.mutate({ email: account.email, password: account.password });
  };

  return (
    <div className="min-h-screen md:flex">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-primary p-10 text-white md:flex md:w-2/5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-white/10">
            <CalendarCheck2 className="h-12 w-12 text-brand-accent" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold">
            <span className="text-brand-accent">WFH</span> Attendance
          </p>
          <div className="max-w-sm text-center">
            <p className="text-white/85">
              Clock in from home with a live photo and your location, and let HRD watch
              attendance update in real time.
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50">
              <MapPin className="h-3.5 w-3.5" /> Photo + location, captured once per clock-in
            </p>
          </div>
        </div>
        {/* <p className="relative z-10 text-center text-xs text-white/40">A personal project, not affiliated with any employer.</p> */}
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-ink-primary md:hidden">
              <CalendarCheck2 className="h-6 w-6 text-brand-accent-on-light" />
              <span className="text-brand-accent-on-light">WFH</span> Attendance
            </h1>
            <h2 className="mt-2 text-2xl font-semibold text-ink-primary">Sign in</h2>
            <p className="mt-1 text-sm text-ink-secondary">Use your work email and password.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-xs text-status-absent">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" autoComplete="current-password" {...register('password')} />
              {errors.password && <p className="text-xs text-status-absent">{errors.password.message}</p>}
            </div>

            {login.isError && (
              <div className="flex items-start gap-2 rounded-lg border border-status-absent/30 bg-status-absent/10 p-3 text-sm text-status-absent">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{apiErrorMessage(login.error)}</span>
              </div>
            )}

            <Button type="submit" className="w-full" loading={login.isPending && !activeDemoEmail}>
              Sign in
            </Button>
          </form>

          {DEMO_LOGIN_ENABLED && (
            <div className="space-y-2 border-t border-border pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Demo accounts</p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoClick(account)}
                    disabled={login.isPending}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-card p-3 text-left text-sm transition-colors hover:bg-surface-plane disabled:opacity-60',
                    )}
                  >
                    <span>
                      <span className="block font-medium text-ink-primary">{account.label}</span>
                      <span className="block text-xs text-ink-muted">
                        {account.email} · {account.password}
                      </span>
                      {account.note && <span className="mt-0.5 block text-xs text-ink-muted">{account.note}</span>}
                    </span>
                    {login.isPending && activeDemoEmail === account.email && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-muted" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

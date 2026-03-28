'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';
import { PENDING_SAVE_FLAG } from '@/lib/pending-saves';
import type { ChannelAnalysis } from '@/types/analysis';

export type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  onSuccess: () => void;
  onToggleMode: () => void;
  onSignupConfirmation?: () => void;
  onDismiss?: () => void;
  pendingAnalysis?: ChannelAnalysis | null;
}

const AUTH_ENDPOINTS: Record<AuthMode, string> = {
  login: '/api/login',
  signup: '/api/register',
};

const FALLBACK_ERRORS: Record<AuthMode, string> = {
  login: 'Login failed',
  signup: 'Registration failed',
};

const INPUT_CLASSES = cn(
  'w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30',
  'focus:border-[rgba(201,103,232,0.4)] focus:ring-1 focus:ring-[rgba(201,103,232,0.2)] focus:outline-none',
  'transition-colors'
);

export function AuthForm({
  mode,
  onSuccess,
  onToggleMode,
  onSignupConfirmation,
  onDismiss,
  pendingAnalysis,
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(AUTH_ENDPOINTS[mode], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(mode === 'signup' && pendingAnalysis ? { pendingAnalysis } : {}),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.reason || FALLBACK_ERRORS[mode]);
        return;
      }

      if (mode === 'login') {
        window.location.reload();
        return;
      } else {
        setConfirmationSent(true);
        onSignupConfirmation?.();
        if (pendingAnalysis) {
          try { localStorage.setItem(PENDING_SAVE_FLAG, 'true'); } catch {}
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex flex-col items-center text-center py-4 space-y-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[var(--vm-gradient-start)] to-[var(--vm-gradient-end)]">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Check your email</h3>
        <p className="text-sm text-white/50 max-w-[280px]">
          We sent a confirmation link to{' '}
          <span className="text-white/80">{email}</span>. Click the link to
          activate your account.
        </p>
        <Button variant="gradient" className="w-full mt-2" onClick={onDismiss}>
          Got it
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className={INPUT_CLASSES}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className={INPUT_CLASSES}
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--vm-error)] mt-2">{error}</p>
      )}

      <Button
        type="submit"
        variant="gradient"
        className="w-full"
        loading={isLoading}
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>

      <ToggleModePrompt mode={mode} onToggle={onToggleMode} />
    </form>
  );
}

interface ToggleModePromptProps {
  mode: AuthMode;
  onToggle: () => void;
}

function ToggleModePrompt({ mode, onToggle }: ToggleModePromptProps): React.ReactElement {
  const isLogin = mode === 'login';

  return (
    <p className="text-sm text-white/50 text-center">
      {isLogin ? "Don't have an account? " : 'Already have an account? '}
      <button
        type="button"
        onClick={onToggle}
        className="text-white/80 hover:text-white underline-offset-2 hover:underline transition-colors"
      >
        {isLogin ? 'Sign up' : 'Log in'}
      </button>
    </p>
  );
}

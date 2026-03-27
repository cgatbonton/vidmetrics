'use client';

import { useState, type FormEvent } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
  onToggleMode: () => void;
}

const INPUT_CLASSES = cn(
  'w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30',
  'focus:border-[rgba(201,103,232,0.4)] focus:ring-1 focus:ring-[rgba(201,103,232,0.2)] focus:outline-none',
  'transition-colors'
);

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError('Invalid email or password');
          return;
        }

        onSuccess();
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        onSuccess();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

      <p className="text-sm text-white/50 text-center">
        {mode === 'login'
          ? "Don't have an account? "
          : 'Already have an account? '}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-white/80 hover:text-white underline-offset-2 hover:underline transition-colors"
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </form>
  );
}

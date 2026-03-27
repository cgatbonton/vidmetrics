'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  transparent?: boolean;
}

export function Navbar({
  onLoginClick,
  onSignUpClick,
  transparent = false,
}: NavbarProps) {
  const { user } = useAuth();

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
  }

  return (
    <nav
      className={cn(
        'sticky top-0 z-50',
        !transparent &&
          'border-b border-white/5 bg-[rgba(28,27,36,0.15)] backdrop-blur-md',
        transparent && 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="font-semibold text-white">
          VidMetrics
        </a>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="flex items-center gap-2 text-sm text-white/60">
                <User className="w-4 h-4" />
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Log out
                </span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onLoginClick}>
                Log in
              </Button>
              <Button variant="primary" size="sm" onClick={onSignUpClick}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { User, LogOut, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  transparent?: boolean;
}

const GLASS_SURFACE = 'border-b border-white/5 bg-[rgba(28,27,36,0.15)] backdrop-blur-md';
const MOBILE_PANEL = 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5';

export function Navbar({
  onLoginClick,
  onSignUpClick,
  transparent = false,
}: NavbarProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const onLoginClickRef = useRef(onLoginClick);
  onLoginClickRef.current = onLoginClick;
  const onSignUpClickRef = useRef(onSignUpClick);
  onSignUpClickRef.current = onSignUpClick;

  useScrollLock(mobileMenuOpen);

  async function handleSignOut(): Promise<void> {
    setMobileMenuOpen(false);
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  function handleMobileLogin(): void {
    setMobileMenuOpen(false);
    onLoginClickRef.current?.();
  }

  function handleMobileSignUp(): void {
    setMobileMenuOpen(false);
    onSignUpClickRef.current?.();
  }

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { y: -10, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -10, opacity: 0 },
        transition: { duration: 0.2 },
      };

  return (
    <nav className={cn('sticky top-0 z-40', transparent ? 'bg-transparent' : GLASS_SURFACE)}>
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="font-semibold text-white">
          VidMetrics
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          {user ? <AuthenticatedNav email={user.email ?? ''} onSignOut={handleSignOut} /> : (
            <GuestNav onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} />
          )}
        </div>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          className="md:hidden w-11 h-11 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={cn(MOBILE_PANEL, 'md:hidden px-4 py-4 space-y-2')}
            {...motionProps}
          >
            {user ? (
              <MobileAuthenticatedNav
                email={user.email ?? ''}
                onSignOut={handleSignOut}
              />
            ) : (
              <MobileGuestNav
                onLoginClick={handleMobileLogin}
                onSignUpClick={handleMobileSignUp}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ─── Desktop sub-components ─── */

interface AuthenticatedNavProps {
  email: string;
  onSignOut: () => void;
}

function AuthenticatedNav({ email, onSignOut }: AuthenticatedNavProps): React.ReactElement {
  return (
    <>
      <span className="flex items-center gap-2 text-sm text-white/60">
        <User className="w-4 h-4" />
        {email}
      </span>
      <Button variant="ghost" size="sm" onClick={onSignOut}>
        <span className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Log out
        </span>
      </Button>
    </>
  );
}

interface GuestNavProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

function GuestNav({ onLoginClick, onSignUpClick }: GuestNavProps): React.ReactElement {
  return (
    <>
      <Button variant="ghost" size="sm" onClick={onLoginClick}>
        Log in
      </Button>
      <Button variant="primary" size="sm" onClick={onSignUpClick}>
        Sign Up
      </Button>
    </>
  );
}

/* ─── Mobile sub-components ─── */

interface MobileAuthenticatedNavProps {
  email: string;
  onSignOut: () => void;
}

function MobileAuthenticatedNav({ email, onSignOut }: MobileAuthenticatedNavProps): React.ReactElement {
  return (
    <>
      <span className="flex items-center gap-2 text-sm text-white/60 px-1 py-2">
        <User className="w-4 h-4 shrink-0" />
        <span className="max-w-[200px] truncate">{email}</span>
      </span>
      <Button variant="ghost" size="sm" className="w-full min-h-[48px]" onClick={onSignOut}>
        <span className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Log out
        </span>
      </Button>
    </>
  );
}

interface MobileGuestNavProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

function MobileGuestNav({ onLoginClick, onSignUpClick }: MobileGuestNavProps): React.ReactElement {
  return (
    <>
      <Button variant="ghost" size="sm" className="w-full min-h-[48px]" onClick={onLoginClick}>
        Log in
      </Button>
      <Button variant="primary" size="sm" className="w-full min-h-[48px]" onClick={onSignUpClick}>
        Sign Up
      </Button>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AuthForm, type AuthMode } from '@/components/auth/AuthForm';
import type { ChannelAnalysis } from '@/types/analysis';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
  pendingAnalysis?: ChannelAnalysis | null;
}

const MODE_TITLES: Record<AuthMode, string> = {
  login: 'Welcome Back',
  signup: 'Create Account',
};

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
  pendingAnalysis,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setConfirmationSent(false);
    }
  }, [isOpen, initialMode]);

  function handleLoginSuccess(): void {
    onClose();
    onSuccess?.();
  }

  function handleSignupConfirmation(): void {
    setConfirmationSent(true);
  }

  function toggleMode(): void {
    setMode(mode === 'login' ? 'signup' : 'login');
  }

  const title = confirmationSent ? 'Almost There' : MODE_TITLES[mode];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <AuthForm
        mode={mode}
        onSuccess={handleLoginSuccess}
        onToggleMode={toggleMode}
        onSignupConfirmation={handleSignupConfirmation}
        onDismiss={onClose}
        pendingAnalysis={pendingAnalysis}
      />
    </Modal>
  );
}

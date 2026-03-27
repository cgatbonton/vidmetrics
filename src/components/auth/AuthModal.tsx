'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AuthForm } from '@/components/auth/AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  function handleSuccess() {
    onClose();
    onSuccess?.();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Welcome Back' : 'Create Account'}
    >
      <AuthForm
        mode={mode}
        onSuccess={handleSuccess}
        onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
      />
    </Modal>
  );
}

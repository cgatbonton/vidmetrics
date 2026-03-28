'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';
import { useSavedChannels } from '@/hooks/useSavedChannels';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UrlInput } from './UrlInput';
import { HeroVideo } from './HeroVideo';
import { AnalyticsSection } from './AnalyticsSection';
import { AuthModal } from '@/components/auth/AuthModal';
import { PENDING_SAVE_FLAG } from '@/lib/pending-saves';
import type { ChannelAnalysis } from '@/types/analysis';

const PENDING_SAVE_KEY = 'vm:pendingSave';
const PENDING_SAVE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export default function Hero() {
  const [analysisData, setAnalysisData] = useState<ChannelAnalysis | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [pendingSave, setPendingSave] = useState(false);
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();
  const { saveChannel } = useSavedChannels();
  const saveChannelRef = useRef(saveChannel);
  saveChannelRef.current = saveChannel;

  const executeSave = useCallback(async (data: ChannelAnalysis) => {
    const result = await saveChannelRef.current(data);
    if (result.error) {
      addToast(result.error.reason, 'error');
    } else {
      addToast('Analytics saved successfully', 'success');
    }
  }, [addToast]);

  // After login (not signup): user becomes non-null while pendingSave is true
  // For signup, the server-side claim in auth-context handles it via localStorage flag
  useEffect(() => {
    if (user && pendingSave && analysisData) {
      setPendingSave(false);
      try {
        if (localStorage.getItem(PENDING_SAVE_FLAG)) return;
      } catch {}
      executeSave(analysisData);
    }
  }, [user, pendingSave, analysisData, executeSave]);

  // After email confirmation with page reload: restore pending save from sessionStorage (signup path)
  useEffect(() => {
    if (!user || isLoading) return;
    const raw = sessionStorage.getItem(PENDING_SAVE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_SAVE_KEY);
    try {
      const parsed = JSON.parse(raw) as { data: ChannelAnalysis; storedAt: number };
      if (Date.now() - parsed.storedAt > PENDING_SAVE_TTL_MS) return;
      setAnalysisData(parsed.data);
      executeSave(parsed.data);
    } catch { /* corrupted data — discard */ }
  }, [user, isLoading, executeSave]);

  const handleSave = useCallback(async () => {
    if (!analysisData) return;

    if (!user) {
      setPendingSave(true);
      try { localStorage.removeItem(PENDING_SAVE_FLAG); } catch {}
      try {
        sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({
          data: analysisData,
          storedAt: Date.now(),
        }));
      } catch { /* quota exceeded or unavailable — login path still works via in-memory state */ }
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }

    await executeSave(analysisData);
  }, [user, analysisData, executeSave]);

  return (
    <div className="relative min-h-screen bg-[var(--vm-base)] flex flex-col">
      <HeroVideo />

      <Navbar
        transparent
        onLoginClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onSignUpClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
      />

      <div className="relative z-10 text-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <h1 className="vm-gradient-text text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl mx-auto">
          See What Your
          <br />
          Competitors Can&apos;t Hide
        </h1>

        <p className="text-lg text-white/80 max-w-2xl mx-auto mt-6">
          Paste any YouTube channel URL to see which videos are crushing it right now.
        </p>

        <div className="max-w-xl mx-auto mt-10">
          <UrlInput onAnalyze={setAnalysisData} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {analysisData && (
          <AnalyticsSection
            data={analysisData}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (pendingSave) {
            setPendingSave(false);
            try { sessionStorage.removeItem(PENDING_SAVE_KEY); } catch {}
          }
        }}
        initialMode={authMode}
        pendingAnalysis={pendingSave ? analysisData : null}
      />

      <Footer className="mt-auto" />
    </div>
  );
}

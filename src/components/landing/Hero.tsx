'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';
import { useSaves } from '@/hooks/useSaves';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UrlInput } from './UrlInput';
import { HeroVideo } from './HeroVideo';
import { AnalyticsSection } from './AnalyticsSection';
import { AuthModal } from '@/components/auth/AuthModal';
import type { ChannelAnalysis } from '@/types/analysis';

export default function Hero() {
  const [analysisData, setAnalysisData] = useState<ChannelAnalysis | null>(null);
  const [canSave, setCanSave] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();
  const { saveAnalysis } = useSaves();

  const handleSave = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!analysisData) return;

    try {
      // TODO: update useSaves for channel analysis
      await saveAnalysis(analysisData as never);
      addToast('Analytics saved successfully', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    }
  }, [user, analysisData, addToast, saveAnalysis]);

  const handleAnalyze = useCallback((data: ChannelAnalysis, constraints: { canSave: boolean }) => {
    setAnalysisData(data);
    setCanSave(constraints.canSave);
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--vm-base)] flex flex-col">
      <HeroVideo />

      <Navbar
        transparent
        onLoginClick={() => setShowAuthModal(true)}
        onSignUpClick={() => setShowAuthModal(true)}
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
          <UrlInput onAnalyze={handleAnalyze} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {analysisData && (
          <AnalyticsSection
            data={analysisData}
            onSave={handleSave}
            canSave={canSave}
          />
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <Footer className="mt-auto" />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { BarChart3, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { SavedAnalysisTile } from '@/components/dashboard/SavedAnalysisTile';
import { AnalyticsModal } from '@/components/dashboard/AnalyticsModal';
import { useSaves } from '@/hooks/useSaves';
import type { SavedAnalysis } from '@/types/analysis';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { saves, isLoading, fetchSaves } = useSaves();
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchSaves();
    }
  }, [user, fetchSaves]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--vm-base)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--vm-base)] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-white">Your Saved Analyses</h1>
        <p className="text-white/60 mt-2">
          Click any video to see detailed metrics
        </p>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
          </div>
        ) : saves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <BarChart3 className="w-12 h-12 text-white/20" />
            <p className="text-white/50">No saved analyses yet</p>
            <Button variant="ghost" onClick={() => router.push('/')}>
              Go analyze a video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
            {saves.map((save) => (
              <SavedAnalysisTile
                key={save.id}
                analysis={save}
                onClick={() => setSelectedAnalysis(save)}
              />
            ))}
          </div>
        )}
      </main>

      <AnalyticsModal
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        analysis={selectedAnalysis}
      />

      <Footer />
    </div>
  );
}

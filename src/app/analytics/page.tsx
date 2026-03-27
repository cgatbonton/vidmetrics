export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        Analytics
      </h1>
      <p className="mt-2 text-sm text-foreground/60 sm:text-base">
        Deep dive into your video performance metrics.
      </p>

      <div className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="flex min-h-[300px] items-center justify-center p-8 text-sm text-foreground/40">
          Analytics charts will appear here.
        </div>
      </div>
    </div>
  );
}

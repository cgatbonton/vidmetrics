export function Footer({ className }: { className?: string }) {
  return (
    <footer className={`border-t border-white/5${className ? ` ${className}` : ''}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-white/50">
          &copy; {new Date().getFullYear()} VidMetrics
        </p>
        <p className="text-sm text-white/50">YouTube video analytics</p>
      </div>
    </footer>
  );
}

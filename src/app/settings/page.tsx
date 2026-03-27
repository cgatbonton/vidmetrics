export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        Settings
      </h1>
      <p className="mt-2 text-sm text-foreground/60 sm:text-base">
        Configure your account and preferences.
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg border border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
          <h2 className="text-base font-semibold sm:text-lg">Account</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Manage your account settings and connected services.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
          <h2 className="text-base font-semibold sm:text-lg">Notifications</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Configure how and when you receive alerts.
          </p>
        </div>
      </div>
    </div>
  );
}

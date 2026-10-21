// Squelette affiché pendant le chargement d'un écran du back-office.
export default function AdminLoading() {
  return (
    <div className="grid gap-6" role="status" aria-label="Chargement">
      <div className="grid gap-2">
        <span className="h-3 w-24 animate-pulse rounded-full bg-night/10" />
        <span className="h-9 w-72 max-w-full animate-pulse rounded-xl bg-night/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-night/[0.07]" />
        ))}
      </div>
      <span className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-night/[0.07]" />
    </div>
  );
}

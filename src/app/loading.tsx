export default function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center bg-beige px-4" role="status" aria-label="Chargement de la page">
      <div className="flex flex-col items-center gap-4">
        <span className="relative grid size-12 place-items-center rounded-full border border-gold/40 bg-white/70">
          <span className="absolute inset-1 rounded-full border-2 border-transparent border-t-gold motion-safe:animate-spin" />
          <span className="size-2 rounded-full bg-night" />
        </span>
        <span className="h-1 w-28 overflow-hidden rounded-full bg-night/10">
          <span className="block h-full w-1/2 rounded-full bg-gold motion-safe:animate-pulse" />
        </span>
        <span className="text-sm text-institution">Chargement…</span>
      </div>
    </div>
  );
}

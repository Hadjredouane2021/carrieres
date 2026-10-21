export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-white" role="status" aria-label="Chargement">
      <div className="relative h-1 w-32 overflow-hidden rounded-full bg-night/10">
        <span className="absolute inset-y-0 start-0 w-1/2 animate-pulse rounded-full bg-sun" />
      </div>
    </div>
  );
}

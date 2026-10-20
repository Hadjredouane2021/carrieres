"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-beige px-6 text-center">
      <div className="max-w-lg">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Forum 2026</p>
        <h1 className="display mt-3 text-4xl text-night">La page n'a pas pu s'afficher</h1>
        <p className="mt-3 text-institution">Si la base MySQL n'est pas démarrée, lancez-la puis réessayez.</p>
        <button type="button" onClick={reset} className="mt-6 h-11 rounded-full bg-night px-5 text-beige">
          Réessayer
        </button>
      </div>
    </main>
  );
}

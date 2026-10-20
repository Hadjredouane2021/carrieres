import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-night px-6 text-center text-beige">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">404</p>
        <h1 className="display mt-3 text-5xl text-white">Cette page n'existe pas</h1>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-gold px-5 font-semibold text-night">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}

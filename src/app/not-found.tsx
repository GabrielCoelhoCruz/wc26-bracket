import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-gold">
        404
      </p>
      <h1 className="font-scoreboard mb-4 text-5xl font-black text-foreground sm:text-6xl">
        Fora de jogo
      </h1>
      <p className="mb-2 max-w-md text-muted-foreground">
        Esta página não existe ou o link de bracket expirou.
      </p>
      <p className="mb-8 max-w-md text-sm text-muted-foreground/80">
        This page does not exist or the bracket link is invalid.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-bold text-background transition hover:brightness-110"
      >
        Voltar ao início / Back home
      </Link>
    </div>
  )
}

"use client"

import { useEffect } from "react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app] unhandled error", error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-danger">
        Erro
      </p>
      <h1 className="font-scoreboard mb-4 text-4xl font-black text-foreground sm:text-5xl">
        Algo deu errado
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Ocorreu um erro inesperado. Tente recarregar a página.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-bold text-background transition hover:brightness-110"
      >
        Tentar novamente
      </button>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-16 text-center">
      <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-[var(--accent)] mb-4">
        WC26
      </h1>
      <p className="text-xl md:text-2xl text-zinc-400 max-w-lg mb-12">
        Monte seu bracket. Monte seu XI. Desafie seus amigos.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <a
          href="/bracket"
          className="px-8 py-4 bg-[var(--pitch-green)] hover:bg-[var(--pitch-light)] text-white font-bold text-lg rounded-lg transition-colors"
        >
          BRACKET →
        </a>
        <a
          href="/draft"
          className="px-8 py-4 border border-[var(--card-border)] hover:border-[var(--accent)] text-zinc-300 font-bold text-lg rounded-lg transition-colors"
        >
          DRAFT →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 text-left">
          <span className="text-[var(--accent)] text-sm font-bold">01</span>
          <h3 className="text-white font-bold text-lg mt-2">Predict</h3>
          <p className="text-zinc-400 text-sm mt-1">Fill your bracket</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 text-left">
          <span className="text-[var(--accent)] text-sm font-bold">02</span>
          <h3 className="text-white font-bold text-lg mt-2">Draft</h3>
          <p className="text-zinc-400 text-sm mt-1">Build your dream XI</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 text-left">
          <span className="text-[var(--accent)] text-sm font-bold">03</span>
          <h3 className="text-white font-bold text-lg mt-2">Compete</h3>
          <p className="text-zinc-400 text-sm mt-1">Share and rank</p>
        </div>
      </div>
    </div>
  )
}

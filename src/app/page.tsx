export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-16 text-center">
      {/* Small top label — 7a0 style */}
      <p className="text-sm text-zinc-500 mb-6 tracking-wide">
        Dream World Cup · 2026
      </p>

      {/* Massive hero heading */}
      <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-white leading-none mb-4">
        WC26
      </h1>

      {/* Clean subtitle */}
      <p className="text-lg md:text-xl text-zinc-400 max-w-md mb-12">
        Monte seu bracket. Monte seu XI. Desafie seus amigos.
      </p>

      {/* CTA buttons — 7a0 style */}
      <div className="flex flex-col sm:flex-row gap-4 mb-24">
        <a
          href="/bracket"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a5c2a] hover:brightness-110 text-white font-bold text-lg rounded-lg transition-all"
        >
          BRACKET →
        </a>
        <a
          href="/draft"
          className="relative inline-flex items-center gap-2 px-8 py-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-bold text-lg rounded-lg transition-all"
        >
          DRAFT
          <span className="inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full">
            ⚡
          </span>
        </a>
      </div>

      {/* Steps — 7a0 style numbered layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        <div className="text-center">
          <span className="text-[#fbbf24] text-sm font-bold tracking-widest">01</span>
          <h3 className="text-white font-bold text-xl mt-2">Predict</h3>
          <p className="text-zinc-500 text-sm mt-1">Fill your bracket</p>
        </div>
        <div className="text-center">
          <span className="text-[#fbbf24] text-sm font-bold tracking-widest">02</span>
          <h3 className="text-white font-bold text-xl mt-2">Draft</h3>
          <p className="text-zinc-500 text-sm mt-1">Build your dream XI</p>
        </div>
        <div className="text-center">
          <span className="text-[#fbbf24] text-sm font-bold tracking-widest">03</span>
          <h3 className="text-white font-bold text-xl mt-2">Compete</h3>
          <p className="text-zinc-500 text-sm mt-1">Share and rank</p>
        </div>
      </div>
    </div>
  )
}

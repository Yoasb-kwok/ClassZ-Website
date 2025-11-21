export function Partners() {
  return (
    <section className="py-12 bg-white border-b border-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span className="font-medium">Funded by:</span>
            <div className="h-8 w-24 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-400">
              Cyberport
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-8 flex-wrap justify-center">
            <span className="font-medium">Trusted by:</span>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-20 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-400"
              >
                Partner {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

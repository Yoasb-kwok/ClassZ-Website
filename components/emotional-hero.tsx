export function EmotionalHero() {
  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/mother-hugging-child-happy.jpg" alt="Mother and child" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight drop-shadow-lg">
          Everything Parents Need,
          <br />
          Thoughtfully Designed.
        </h2>
      </div>
    </section>
  )
}

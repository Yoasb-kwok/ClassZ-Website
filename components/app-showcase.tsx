import { Apple, Play } from "lucide-react"

export function AppShowcase() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Collage */}
          <div className="hidden lg:grid grid-cols-2 gap-4 w-1/3 opacity-80">
            <div className="space-y-4 mt-12">
              <img
                src="/kid-painting.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
              <img
                src="/kid-reading.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
            </div>
            <div className="space-y-4">
              <img
                src="/kid-sports.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
              <img
                src="/kid-music.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 text-center max-w-xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-brand-slate">Discover Exceptional Classes.</h2>
            <p className="text-lg text-brand-slate/80 mb-10 leading-relaxed">
              Understand your child's progress with insights, and build a foundation for their future success.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="flex items-center gap-3 bg-brand-slate text-white px-6 py-3 rounded-xl hover:bg-brand-slate transition-colors w-full sm:w-auto justify-center">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-medium">Download on the</div>
                  <div className="text-sm font-bold leading-none">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-brand-slate text-white px-6 py-3 rounded-xl hover:bg-brand-slate transition-colors w-full sm:w-auto justify-center">
                <Play className="w-6 h-6 fill-current" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-medium">Get it on</div>
                  <div className="text-sm font-bold leading-none">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Collage */}
          <div className="hidden lg:grid grid-cols-2 gap-4 w-1/3 opacity-80">
            <div className="space-y-4">
              <img
                src="/kid-swimming.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
              <img
                src="/kid-dancing.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
            </div>
            <div className="space-y-4 mt-12">
              <img
                src="/kid-coding.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
              <img
                src="/kid-science.jpg"
                className="rounded-2xl w-full object-cover shadow-lg"
                alt="Activity"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

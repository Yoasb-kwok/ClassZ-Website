import { Apple, Play } from "lucide-react"

export function FinalCta() {
  return (
    <section className="py-24 bg-classz-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-brand-slate leading-tight">
              Every Child Has a Story.
              <br />
              Help Them Write Theirs.
            </h2>
            <p className="text-xl text-brand-slate/80 max-w-lg">
              Discover the classes and experiences that shape who they become — all in Classz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="flex items-center gap-3 bg-brand-slate text-white px-6 py-3 rounded-xl hover:bg-brand-slate transition-colors w-full sm:w-auto justify-center">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-medium">Download on the</div>
                  <div className="text-sm font-bold leading-none">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-white border border-classz-100 text-brand-slate px-6 py-3 rounded-xl hover:bg-classz-50 transition-colors w-full sm:w-auto justify-center">
                <Play className="w-6 h-6 fill-current" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-medium">Get it on</div>
                  <div className="text-sm font-bold leading-none">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative z-10 mx-auto max-w-[300px]">
              <div className="bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white overflow-hidden">
                <img src="/placeholder.svg?height=600&width=300" alt="App Home Screen" className="w-full h-auto" />
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-classz-200/60 rounded-full blur-3xl -z-0" />
          </div>
        </div>
      </div>
    </section>
  )
}

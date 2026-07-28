import { Search, Calendar, TrendingUp } from "lucide-react"

export function ThreePillars() {
  return (
    <section className="py-20 bg-classz-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Explore Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Explore</h3>
              <p className="text-brand-slate/80">Discover top centres by program type and category.</p>
            </div>
            <div className="bg-slate-100 rounded-2xl p-4 aspect-[4/5] relative overflow-hidden group">
              {/* Mockup UI */}
              <div className="absolute inset-x-4 top-4 bottom-0 bg-white rounded-t-2xl shadow-lg p-4 border border-classz-50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="h-2 w-20 bg-slate-200 rounded" />
                </div>
                <div className="h-32 bg-classz-100 rounded-xl mb-4 flex items-center justify-center">
                  <Search className="text-classz-400 w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded" />
                  <div className="h-2 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Book Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Book</h3>
              <p className="text-brand-slate/80">Enroll instantly with class schedules and multiple payments methods.</p>
            </div>
            <div className="bg-slate-100 rounded-2xl p-4 aspect-[4/5] relative overflow-hidden">
              {/* Mockup UI */}
              <div className="absolute inset-x-4 top-4 bottom-0 bg-white rounded-t-2xl shadow-lg p-4 border border-classz-50">
                <div className="h-4 w-1/3 bg-slate-200 rounded mb-6" />
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-classz-50 flex justify-between items-center">
                    <div className="h-2 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-4 rounded-full border border-slate-300" />
                  </div>
                  <div className="p-3 rounded-lg bg-classz-400 text-white flex justify-between items-center">
                    <div className="text-xs font-medium">Confirm Booking</div>
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Track Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Track</h3>
              <p className="text-brand-slate/80">Stay organized with performance feedback, and growth updates.</p>
            </div>
            <div className="bg-slate-100 rounded-2xl p-4 aspect-[4/5] relative overflow-hidden">
              {/* Mockup UI */}
              <div className="absolute inset-x-4 top-4 bottom-0 bg-white rounded-t-2xl shadow-lg p-4 border border-classz-50">
                <div className="flex justify-between items-end mb-6">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="text-orange-500 w-8 h-8" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-100" />
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-100 rounded" />
                  <div className="h-2 w-full bg-slate-100 rounded" />
                  <div className="h-2 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

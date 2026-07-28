export function WhyChoose() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-slate mb-4">A New Standard in Learning.</h2>
          <p className="text-xl text-brand-slate/70">Why families choose Classz?</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-4">
            <span className="text-6xl font-light text-slate-200">01</span>
            <h3 className="text-xl font-bold text-brand-slate">Targeted Learning</h3>
            <p className="text-brand-slate/80 leading-relaxed">
              Identify what works best for your child and invest in the classes that nurture their strengths.
            </p>
          </div>
          <div className="space-y-4">
            <span className="text-6xl font-light text-slate-200">02</span>
            <h3 className="text-xl font-bold text-brand-slate">Inclusive Community</h3>
            <p className="text-brand-slate/80 leading-relaxed">
              Discover <span className="italic">SEN-friendly</span>, nurturing environments for every child.
            </p>
          </div>
          <div className="space-y-4">
            <span className="text-6xl font-light text-slate-200">03</span>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-brand-slate">Holistic Support</h3>
              <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                Beta
              </span>
            </div>
            <p className="text-brand-slate/80 leading-relaxed">
              Workshops, assessments, and activities that grow with your family.
            </p>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
          <div className="col-span-1 row-span-2 relative overflow-hidden rounded-2xl">
            <img
              src="/placeholder.svg?height=600&width=400"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              alt="Family"
            />
          </div>
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl">
            <img
              src="/placeholder.svg?height=300&width=400"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              alt="Child"
            />
          </div>
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl">
            <img
              src="/placeholder.svg?height=300&width=400"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              alt="Mom"
            />
          </div>
          <div className="col-span-1 row-span-2 relative overflow-hidden rounded-2xl">
            <img
              src="/placeholder.svg?height=600&width=400"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              alt="Dad"
            />
          </div>
          <div className="col-span-2 row-span-1 relative overflow-hidden rounded-2xl">
            <img
              src="/placeholder.svg?height=300&width=800"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              alt="Reading"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

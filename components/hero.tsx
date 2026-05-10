import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: 'calc(var(--vh, 1vh) * 85)' }}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/family-snow-winter-happy.jpg" alt="Family in snow" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white max-w-4xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
          Unlock Your Child's
          <br />
          Full Potential.
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto drop-shadow-md text-white/90">
          Discover, book, and track your child's learning — all in one trusted platform.
        </p>
        <Button className="bg-classz-400 hover:bg-classz-500 text-white rounded-full px-8 py-6 text-lg h-auto group">
          Explore More
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  )
}

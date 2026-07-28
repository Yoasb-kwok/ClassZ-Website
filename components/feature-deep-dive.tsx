import { CheckCircle2 } from "lucide-react"

export function FeatureDeepDive() {
  return (
    <div className="bg-white">
      {/* Section 1: Discover & Book */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="text-brand-slate/70 font-medium uppercase tracking-wider text-sm">
              Discover & Book Effortlessly
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 text-brand-slate">Find the right fit for every child.</h2>
          </div>

          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-32">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-brand-slate">Explore Top Centres</h3>
              <p className="text-lg text-brand-slate/80 leading-relaxed">
                Discover top centres by program type and category. Filter by location, age group, and price to find the
                perfect match for your child's needs.
              </p>
              <ul className="space-y-3">
                {["Verified Reviews", "Detailed Curriculums", "Instructor Profiles"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-brand-slate">
                    <CheckCircle2 className="w-5 h-5 text-classz-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="bg-classz-50 rounded-[3rem] p-8 relative z-10">
                <img
                  src="/app-interface-class-details.jpg"
                  alt="App Interface"
                  className="w-full rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-classz-100/80 rounded-full blur-3xl -z-0" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-brand-slate">Book Programs with Ease</h3>
              <p className="text-lg text-brand-slate/80 leading-relaxed">
                Enroll in just a few taps with flexible schedules. Secure payment processing and instant confirmation
                give you peace of mind.
              </p>
            </div>
            <div className="flex-1">
              <img
                src="/woman-using-phone-cafe.jpg"
                alt="Booking Ease"
                className="rounded-3xl shadow-xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Clarity & Control */}
      <section className="py-24 bg-classz-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="text-brand-slate/70 font-medium uppercase tracking-wider text-sm">Clarity & Control</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 text-brand-slate">
              Discover your child's strength with confidence.
            </h2>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-32">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-brand-slate">Stay Organized</h3>
              <p className="text-lg text-brand-slate/80 leading-relaxed">
                Manage schedules, attendance, and updates from every centre, all in one place. Never miss a class or an
                important announcement again.
              </p>
            </div>
            <div className="flex-1 relative">
              <div className="bg-white rounded-[3rem] p-8 relative z-10 shadow-sm">
                <img
                  src="/calendar-app-ui.jpg"
                  alt="Calendar Interface"
                  className="w-full rounded-2xl shadow-lg border border-classz-50"
                />
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-brand-slate">Protected Bookings</h3>
              <p className="text-lg text-brand-slate/80 leading-relaxed">
                Enjoy full credit refunds for any centre-initiated cancellations. We prioritize your flexibility and
                ensure your investment is safe.
              </p>
            </div>
            <div className="flex-1">
              <img
                src="/family-looking-at-tablet.jpg"
                alt="Family Tablet"
                className="rounded-3xl shadow-xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Growth & Connection */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="text-brand-slate/70 font-medium uppercase tracking-wider text-sm">Growth & Connection</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 text-brand-slate">
              Because every class is a step in their story.
            </h2>
          </div>

          {/* Feature 5 */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-32">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-brand-slate">Cherish Every Moment</h3>
              <p className="text-lg text-brand-slate/80 leading-relaxed">
                Celebrate milestones and record memories with private class photos. Share these precious moments with
                family members securely.
              </p>
            </div>
            <div className="flex-1 relative">
              <div className="bg-classz-50 rounded-[3rem] p-8 relative z-10">
                <img
                  src="/photo-feed-app-ui.jpg"
                  alt="Photo Feed Interface"
                  className="w-full rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-brand-slate">Intuitive Insights</h3>
              <p className="text-lg text-brand-slate/80 leading-relaxed">
                Track progress and reveal your child's real potential with performance feedback. Visual charts help you
                understand their strengths.
              </p>
            </div>
            <div className="flex-1">
              <img
                src="/father-playing-with-child.jpg"
                alt="Father and Child"
                className="rounded-3xl shadow-xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

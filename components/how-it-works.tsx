export function HowItWorks() {
  return (
    <section className="border-t border-[#E9E9E9] bg-white">
      <div className="container mx-auto px-4 md:px-10 py-[120px]">
        <div className="flex flex-col gap-[80px]">
          {/* Header */}
          <div className="flex flex-col gap-[30px]">
            <div className="flex flex-col items-center gap-[50px] py-5">
              <div className="flex flex-col justify-center items-center gap-5 w-full">
                <h2 className="text-3xl md:text-4xl font-medium text-[#292929] leading-[0.9] tracking-[-0.03em] text-center">
                  Experience the Journey
                </h2>
                <p className="text-base font-normal text-[#6F6F6F] leading-[1.4] tracking-[-0.005em] text-center">
                  With moments in our growing community
                </p>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="flex flex-col md:flex-row gap-[50px] w-full px-0 md:px-[156px]">
            {/* Left Column - Two Images */}
            <div className="flex flex-col gap-[10px] flex-1">
              <div className="h-[300px] rounded-[30px] overflow-hidden">
                <img
                  src="/family-snow-winter-happy.jpg"
                  alt="Family moments"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[300px] rounded-[30px] overflow-hidden">
                <img
                  src="/mother-hugging-child-happy.jpg"
                  alt="Family moments"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column - One Large Image */}
            <div className="flex flex-col justify-center gap-[50px] flex-1">
              <div className="rounded-[30px] overflow-hidden min-h-[300px]">
                <img
                  src="/father-playing-with-child.jpg"
                  alt="Family moments"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


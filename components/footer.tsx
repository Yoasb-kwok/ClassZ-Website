import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#D8F4F3]">
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-10">
        {/* Mobile Layout */}
        <div className="flex flex-col md:hidden">
          {/* Navigation Sections - 2 Columns */}
          <div className="grid grid-cols-2 gap-6 pb-8">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">Company</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="/our-features" className="block hover:opacity-70 transition-opacity">
                  What we do?
                </Link>
                <Link href="/our-mission" className="block hover:opacity-70 transition-opacity">
                  Our Missions
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">Resources</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="/partnership" className="block hover:opacity-70 transition-opacity">
                  Partnership
                </Link>
                <Link href="/faqs" className="block hover:opacity-70 transition-opacity">
                  FAQs
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">Legal</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="#" className="block hover:opacity-70 transition-opacity">
                  Privacy Policy
                </Link>
                <Link href="#" className="block hover:opacity-70 transition-opacity">
                  Terms of Service
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">Follow</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <Instagram className="w-4 h-4" />
                  classz.hk
                </Link>
                <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <Facebook className="w-4 h-4" />
                  Classz HK
                </Link>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="border-t border-[#B8E4E2] w-full"></div>

          {/* Logo Section - Centered */}
          <div className="flex justify-center py-8">
            <Link href="/" className="inline-block">
              <span className="text-6xl font-bold text-[#0ABAB5] leading-none">
                Z.<span className="text-5xl">Classz</span>
              </span>
            </Link>
          </div>

          {/* Separator Line */}
          <div className="border-t border-[#B8E4E2] w-full"></div>

          {/* Copyright - Centered */}
          <div className="flex justify-center pt-6 pb-2">
            <p className="text-xs text-[#6B7C5A]">© 2025 ClassZ Limited. All rights reserved.</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col">
          {/* Main Footer Content */}
          <div className="flex flex-row items-center justify-between gap-8 md:gap-12 pb-6">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link href="/" className="inline-block">
                <span className="text-5xl lg:text-6xl font-bold text-[#0ABAB5]">
                  Z.<span className="text-4xl lg:text-5xl">Classz</span>
                </span>
              </Link>
            </div>

            {/* Navigation Columns */}
            <div className="flex flex-wrap gap-8 md:gap-12 flex-1 justify-end">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#111929]">Company</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="/our-features" className="block hover:opacity-70 transition-opacity">
                    What we do?
                  </Link>
                  <Link href="/our-mission" className="block hover:opacity-70 transition-opacity">
                    Our Missions
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#111929]">Resources</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="/partnership" className="block hover:opacity-70 transition-opacity">
                    Partnership
                  </Link>
                  <Link href="/faqs" className="block hover:opacity-70 transition-opacity">
                    FAQs
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#111929]">Legal</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="#" className="block hover:opacity-70 transition-opacity">
                    Privacy Policy
                  </Link>
                  <Link href="#" className="block hover:opacity-70 transition-opacity">
                    Terms of Service
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#111929]">Follow</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                    <Instagram className="w-4 h-4" />
                    classz.hk
                  </Link>
                  <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                    <Facebook className="w-4 h-4" />
                    Classz HK
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="border-t border-[#B8E4E2] my-6"></div>

          {/* Copyright */}
          <div className="flex justify-end">
            <p className="text-xs text-[#6B7C5A]">© 2025 ClassZ Limited. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

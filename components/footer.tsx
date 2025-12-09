import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#D8F4F3] border-t border-[#E9E9E9]">
      <div className="max-w-[960px] mx-auto w-full px-6 py-10 flex flex-col items-center gap-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full text-center md:text-left">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#111929]">Company</h4>
            <div className="space-y-2 text-sm text-[#292929]">
              <Link href="/our-features" className="hover:opacity-70 transition-opacity">
                What we do?
              </Link>
              <Link href="/our-mission" className="hover:opacity-70 transition-opacity">
                Our Missions
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#111929]">Resources</h4>
            <div className="space-y-2 text-sm text-[#292929]">
              <Link href="/partnership" className="hover:opacity-70 transition-opacity">
                Partnership
              </Link>
              <Link href="/faqs" className="hover:opacity-70 transition-opacity">
                FAQs
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#111929]">Legal</h4>
            <div className="space-y-2 text-sm text-[#292929]">
              <Link href="#" className="hover:opacity-70 transition-opacity">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#111929]">Follow</h4>
            <div className="space-y-2 text-sm text-[#292929]">
              <Link href="#" className="flex items-center justify-center md:justify-start gap-2 hover:opacity-70 transition-opacity">
                <Instagram className="w-4 h-4" />
                classz.hk
              </Link>
              <Link href="#" className="flex items-center justify-center md:justify-start gap-2 hover:opacity-70 transition-opacity">
                <Facebook className="w-4 h-4" />
                Classz HK
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link href="/">
            <img src="/ZClassZ.png" alt="Z.Classz logo" className="h-[48px] w-auto" />
          </Link>
          <p className="text-xs text-[#485A69]">© 2025 ClassZ Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

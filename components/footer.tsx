import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-bold text-[#00C9B7] tracking-tight">Z.Classz</span>
            </Link>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-[#00C9B7]">
                  What we do?
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00C9B7]">
                  Our Missions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-[#00C9B7]">
                  Partnership
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00C9B7]">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-[#00C9B7]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00C9B7]">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Follow</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="#" className="flex items-center gap-2 hover:text-[#00C9B7]">
                  <Instagram className="w-4 h-4" /> Classz.hk
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-2 hover:text-[#00C9B7]">
                  <Facebook className="w-4 h-4" /> Classz.hk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          © 2025 Classz Limited. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path))

  const linkClasses = (path: string) =>
    `${isActive(path) ? "text-[#00C9B7]" : "text-slate-600"} hover:text-[#00C9B7] transition-colors`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#00C9B7] tracking-tight">Z.Classz</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/our-mission" className={linkClasses("/our-mission")}>
            Our Mission
          </Link>
          <Link href="/our-features" className={linkClasses("/our-features")}>
            Our Features
          </Link>
          <Link href="/partnership" className={linkClasses("/partnership")}>
            Partnership
          </Link>
          <Link href="/contact-us" className={linkClasses("/contact-us")}>
            Contact Us
          </Link>
          <Link href="/faqs" className={linkClasses("/faqs")}>
            FAQs
          </Link>
          <button className="hover:text-[#00C9B7] transition-colors">Eng/繁</button>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="#" className="text-sm font-medium text-slate-900 hover:text-[#00C9B7]">
            Log in
          </Link>
          <Button className="bg-[#00C9B7] hover:bg-[#00b3a3] text-white rounded-full px-6">Get Started</Button>
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden p-2 text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  )
}

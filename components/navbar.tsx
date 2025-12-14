"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [open, setOpen] = useState(false)
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
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-slate-100 shadow-sm">
          <div className="px-4 py-4 space-y-3 text-sm font-medium text-slate-700">
            <NavLinkMobile href="/our-mission" active={isActive("/our-mission")} onClick={() => setOpen(false)}>
              Our Mission
            </NavLinkMobile>
            <NavLinkMobile href="/our-features" active={isActive("/our-features")} onClick={() => setOpen(false)}>
              Our Features
            </NavLinkMobile>
            <NavLinkMobile href="/partnership" active={isActive("/partnership")} onClick={() => setOpen(false)}>
              Partnership
            </NavLinkMobile>
            <NavLinkMobile href="/contact-us" active={isActive("/contact-us")} onClick={() => setOpen(false)}>
              Contact Us
            </NavLinkMobile>
            <NavLinkMobile href="/faqs" active={isActive("/faqs")} onClick={() => setOpen(false)}>
              FAQs
            </NavLinkMobile>
            <button className="w-full text-left text-slate-700 hover:text-[#00C9B7] transition-colors">Eng/繁</button>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="#" className="text-sm font-medium text-slate-900 hover:text-[#00C9B7]" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Button className="bg-[#00C9B7] hover:bg-[#00b3a3] text-white rounded-full w-full" onClick={() => setOpen(false)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLinkMobile({
  href,
  children,
  active,
  onClick,
}: {
  href: string
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block ${active ? "text-[#00C9B7]" : "text-slate-700"} hover:text-[#00C9B7] transition-colors`}
    >
      {children}
    </Link>
  )
}

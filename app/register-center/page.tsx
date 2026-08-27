"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function RegisterCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-brand-slate">
      <Navbar />
      <main className="flex-1 min-h-[50vh]" />
      <Footer />
    </div>
  )
}

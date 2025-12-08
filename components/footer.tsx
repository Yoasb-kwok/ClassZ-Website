import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#D8F4F3] border-t border-[#E9E9E9]">
      <div className="flex flex-col justify-end gap-20 pt-5 w-full">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col">
        {/* Main Content */}
        <div className="flex flex-col justify-center items-center gap-10 px-10 py-10 pb-[60px]">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row justify-stretch items-start lg:items-stretch gap-[107px] w-full py-5 border-b border-[#E9E9E9]">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start items-center gap-2.5 px-0 lg:px-[60px] flex-1">
              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src="/ZClassZ.png"
                  alt="Z.Classz logo"
                  className="h-[63px] w-auto"
                />
              </Link>
            </div>

            {/* Nav Items */}
            <div className="flex flex-col sm:flex-row justify-stretch items-stretch gap-[35px] px-6 sm:px-[50px] sm:pl-6 flex-1 backdrop-blur-[30px] rounded-[100px] py-5 bg-white/40">
              {/* Company */}
              <div className="flex flex-col justify-center gap-2.5">
                <h4 className="text-base font-semibold text-[#292929] leading-[1.4] tracking-[-0.025em]">
                  Company
                </h4>
                <Link href="/our-features" className="text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity text-center sm:text-left">
                  What we do?
                </Link>
                <Link href="/our-mission" className="text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity text-center sm:text-left">
                  Our Missions
                </Link>
              </div>

              {/* Resources */}
              <div className="flex flex-col justify-center gap-2.5">
                <h4 className="text-base font-semibold text-[#292929] leading-[1.4] tracking-[-0.025em]">
                  Resources
                </h4>
                <Link href="/partnership" className="text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity text-center sm:text-left">
                  Partnership
                </Link>
                <Link href="/faqs" className="text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity text-center sm:text-left">
                  FAQs
                </Link>
              </div>

              {/* Legal */}
              <div className="flex flex-col justify-center gap-2.5">
                <h4 className="text-base font-semibold text-[#292929] leading-[1.4] tracking-[-0.025em]">
                  Legal
                </h4>
                <Link href="#" className="text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity text-center sm:text-left">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity text-center sm:text-left">
                  Terms of Service
                </Link>
              </div>

              {/* Follow */}
              <div className="flex flex-col justify-center gap-2.5">
                <h4 className="text-base font-semibold text-[#292929] leading-[1.4] tracking-[-0.025em]">
                  Follow
                </h4>
                <Link href="#" className="flex items-center gap-2.5 text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity">
                  <Instagram className="w-[18.55px] h-[18.55px] text-white" strokeWidth={1.5} />
                  classz.hk
                </Link>
                <Link href="#" className="flex items-center gap-2.5 text-base font-normal text-[#292929] leading-[1.4] tracking-[-0.025em] hover:opacity-70 transition-opacity">
                  <Facebook className="w-[18.55px] h-[18.55px] text-white" strokeWidth={1.5} />
                  Classz HK
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex justify-end items-center px-[50px] lg:pl-[120px] pb-5">
          <p className="text-base font-normal text-[#485C11] leading-[1.4] tracking-[-0.01em]">
            © 2025 ClassZ Limited. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </footer>
  )
}

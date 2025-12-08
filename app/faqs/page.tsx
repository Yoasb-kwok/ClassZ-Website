import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"

export default function FAQsPage() {
  const faqs = [
    {
      question: "How do I find the right class for my child?",
      answer: "You can browse classes by category, age group, location, and price. Each centre profile includes detailed information about their programs, instructors, and reviews from other parents."
    },
    {
      question: "How do I book a class?",
      answer: "Simply browse our directory, select a class that interests you, choose your preferred schedule, and complete the booking in just a few clicks. No forms, no hassle!"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit cards, debit cards, and other secure payment options. All transactions are processed securely."
    },
    {
      question: "Can I cancel or reschedule a booking?",
      answer: "Yes, you can manage your bookings through your account. Cancellation policies vary by centre, and you'll receive full credit refunds for any centre-initiated cancellations."
    },
    {
      question: "How do I track my child's progress?",
      answer: "Each centre provides performance feedback and progress reports through the platform. You can view detailed insights about your child's development and growth."
    },
    {
      question: "Are there SEN-friendly options available?",
      answer: "Yes! We have filters specifically designed to help you find SEN-friendly learning environments. Look for the SEN support badge when browsing centres."
    },
    {
      question: "How do education centres join ClassZ?",
      answer: "Education centres can partner with us for free. We provide a free Learning Management System, digital exposure, and growth tools. Contact us through our Partnership page to learn more."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely. We take data privacy seriously and use industry-standard security measures to protect your personal information and payment details."
    }
  ]

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      <div className="pt-20">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Frequently Asked Questions
                </h1>
                <p className="text-xl text-slate-600">
                  Find answers to common questions about ClassZ
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-6 hover:border-[#00C9B7] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-slate-900 flex-1">
                        {faq.question}
                      </h3>
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </div>
                    <p className="mt-4 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center bg-slate-50 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Still have questions?
                </h3>
                <p className="text-slate-600 mb-6">
                  Can't find the answer you're looking for? Please get in touch with our friendly team.
                </p>
                <a
                  href="/contact-us"
                  className="inline-block bg-[#00C9B7] hover:bg-[#00b3a3] text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}


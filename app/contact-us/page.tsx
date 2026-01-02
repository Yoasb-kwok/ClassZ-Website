"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

// API Base URL - Update this to match your backend URL
// For development: http://localhost:3000
// For production: https://dev.classz.co
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://dev.classz.co')

export default function ContactUsPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    priority: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" })

  // Map category from form to backend category
  const mapCategoryToBackend = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "General": "general_inquiry",
      "Partnership": "general_inquiry",
      "Support": "general_inquiry",
      "Feedback": "general_inquiry"
    }
    return categoryMap[category] || "general_inquiry"
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.description) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields (Name, Email, and Description).'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid email address.'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const requestBody = {
        email: formData.email,
        name: formData.name,
        message: formData.description,
        subject: formData.category ? `${formData.category} - ${formData.name}` : `Contact Us - ${formData.name}`,
        category: mapCategoryToBackend(formData.category)
      }

      console.log('Submitting to:', `${API_BASE_URL}/api/parent/contact-form`)
      console.log('Request body:', requestBody)

      const response = await fetch(`${API_BASE_URL}/api/parent/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        setSubmitStatus({
          type: 'error',
          message: `Server error (${response.status}). Please check if the backend is running.`
        })
        return
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Your message has been received. We will get back to you soon.'
        })
        // Reset form
        setFormData({
          name: "",
          email: "",
          category: "",
          priority: "",
          description: ""
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.message || `Failed to submit your message. (Status: ${response.status})`
        })
      }
    } catch (error: any) {
      console.error('Error submitting form:', error)
      let errorMessage = 'An error occurred while submitting your message. Please try again later.'
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = `Cannot connect to server. Please check if the backend is running at ${API_BASE_URL}`
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      {/* Hero */}
      <section className="relative w-full h-[600px] md:h-[720px] overflow-hidden bg-black">
        {/* Background Image - full width, accepts slight vertical crop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/headerContactUs.png')" }}
        />

        {/* Dark Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/55 md:bg-black/45" />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">{t("contactPage.hero.title")}</h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 border-b border-[#E9E9E9]">
        <div className="max-w-[860px] w-full mx-auto px-6 md:px-10 space-y-6">
          <div>
            <h2 className="text-3xl md:text-[32px] font-semibold text-[#111929]">{t("contactPage.intro.title")}</h2>
            <p className="text-[#111929] text-base font-semibold mt-3">
              {t("contactPage.intro.subtitle")}
            </p>
          </div>
          <p className="text-sm md:text-base text-[#485A69] leading-[1.6]">
            {t("contactPage.intro.description")}
          </p>
        </div>
      </section>

      {/* Form Card */}
      <section className="py-14">
        <div className="max-w-[1180px] w-full mx-auto px-4 md:px-6">
          <div className="bg-white border border-[rgba(229,231,235,0.7)] shadow-[0_24px_60px_rgba(0,0,0,0.06)] rounded-[28px] p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField 
                id="name" 
                label={t("contactPage.form.name.label")} 
                placeholder={t("contactPage.form.name.placeholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <FormField 
                id="email" 
                label={t("contactPage.form.email.label")} 
                type="email" 
                placeholder={t("contactPage.form.email.placeholder")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <FormSelect 
                id="category" 
                label={t("contactPage.form.category.label")} 
                placeholder={t("contactPage.form.category.placeholder")}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <FormSelect 
                id="priority" 
                label={t("contactPage.form.priority.label")} 
                placeholder={t("contactPage.form.priority.placeholder")}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                isPriority={true}
              />
              <FormTextArea 
                id="description" 
                label={t("contactPage.form.description.label")} 
                placeholder={t("contactPage.form.description.placeholder")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              
              {/* Status Messages */}
              {submitStatus.type && (
                <div className={`p-4 rounded-lg ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[140px] bg-[#0ABAB5] hover:bg-[#00b3a3] text-white rounded-full h-11 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : t("contactPage.form.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Help */}
      <section className="pb-20">
        <div className="max-w-[960px] w-full mx-auto px-6 md:px-10 space-y-4">
          <h3 className="text-2xl font-semibold text-[#111929]">{t("contactPage.quick.title")}</h3>
          <p className="text-sm md:text-base text-[#485A69]">{t("contactPage.quick.subtitle")}</p>
          <ul className="space-y-2 text-sm md:text-base text-[#00A3A0] font-semibold">
            <li>
              <Link href="/faqs" className="hover:underline">
                {t("contactPage.quick.linkFaqs")}
              </Link>{" "}
              <span className="text-[#485A69] font-normal">{t("contactPage.quick.linkFaqsDesc")}</span>
            </li>
            <li>
              <Link href="/partnership" className="hover:underline">
                {t("contactPage.quick.linkCentres")}
              </Link>{" "}
              <span className="text-[#485A69] font-normal">{t("contactPage.quick.linkCentresDesc")}</span>
            </li>
          </ul>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function FormField({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  id: string
  label: string
  placeholder: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#111929]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full h-12 px-4 rounded-[12px] border border-[#EFF1F3] bg-[#F9FBFD] text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  )
}

function FormSelect({
  id,
  label,
  placeholder,
  value,
  onChange,
  isPriority = false,
}: {
  id: string
  label: string
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  isPriority?: boolean
}) {
  const { t } = useLanguage()
  
  // Determine which options to show based on the field id
  const getOptions = () => {
    if (id === "category") {
      return [
        t("contactPage.form.category.optionGeneral"),
        t("contactPage.form.category.optionPartnership"),
        t("contactPage.form.category.optionSupport"),
        t("contactPage.form.category.optionFeedback"),
      ]
    } else if (id === "priority") {
      return [
        t("contactPage.form.priority.optionLow"),
        t("contactPage.form.priority.optionMedium"),
        t("contactPage.form.priority.optionHigh"),
      ]
    }
    return []
  }

  const options = getOptions()

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#111929]">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value || ""}
          onChange={onChange}
          className="w-full h-12 px-4 pr-10 rounded-[12px] border border-[#EFF1F3] bg-[#F9FBFD] text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent appearance-none"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {isPriority ? (
            <>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </>
          ) : (
            options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))
          )}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B7C3]">▾</span>
      </div>
    </div>
  )
}

function FormTextArea({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  id: string
  label: string
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#111929]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        rows={6}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-[12px] border border-[#EFF1F3] bg-[#F9FBFD] text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  )
}


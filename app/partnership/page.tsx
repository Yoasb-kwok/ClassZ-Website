"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, Heart } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

// API Base URL - Update this to match your backend URL
// Priority: 1. NEXT_PUBLIC_API_BASE_URL env variable, 2. Auto-detect, 3. Fallback
const getApiBaseUrl = () => {
  // Use environment variable if set (highest priority)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }
  
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }
  
  // For localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'
  }
  
  // For production/Vercel, check if we're on the same domain as backend
  // If backend is deployed separately, you MUST set NEXT_PUBLIC_API_BASE_URL
  const hostname = window.location.hostname
  
  // Try to detect backend URL from current domain
  // If frontend is on vercel.app, backend might be on a different domain
  // For now, return empty string to use relative path (requires backend proxy)
  // IMPORTANT: Set NEXT_PUBLIC_API_BASE_URL environment variable in production!
  console.warn('NEXT_PUBLIC_API_BASE_URL not set. Using relative path. This may cause 404 errors if backend is not proxied.')
  return ''
}

const API_BASE_URL = getApiBaseUrl()

const tabs = [
  { id: "overview", labelKey: "partnershipPage.tabs.overview" },
  { id: "obligation", labelKey: "partnershipPage.tabs.obligation" },
  { id: "join", labelKey: "partnershipPage.tabs.join" },
]

export default function PartnershipPage() {
  const { t } = useLanguage()
  const [active, setActive] = useState<string>("overview")

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.slice(1) // Remove the #
    if (hash && tabs.some(tab => tab.id === hash)) {
      setActive(hash)
      // Scroll to tabs section
      setTimeout(() => {
        const tabsSection = document.querySelector('[data-tabs-section]')
        if (tabsSection) {
          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [])

  const overviewImages = ["/card1.png", "/card2.png", "/card3.png", "/card4.png", "/card5.png", "/card6.png"]
  const overviewCards = overviewImages.map((image, idx) => ({
    image,
    title: t(`partnershipPage.overview.card${idx + 1}.title`),
    text: t(`partnershipPage.overview.card${idx + 1}.text`),
  }))

  const obligationImages = ["/co1.png", "/co2.png", "/co3.png"]
  const obligationItems = obligationImages.map((image, idx) => ({
    image,
    badge: t(`partnershipPage.obligation.item${idx + 1}.badge`),
    title: t(`partnershipPage.obligation.item${idx + 1}.title`),
    description: t(`partnershipPage.obligation.item${idx + 1}.description`),
    bullets: [
      t(`partnershipPage.obligation.item${idx + 1}.b1`),
      t(`partnershipPage.obligation.item${idx + 1}.b2`),
      t(`partnershipPage.obligation.item${idx + 1}.b3`),
    ].filter(Boolean),
  }))

  const priorities = [
    { title: t("partnershipPage.priorities.p1.title"), text: t("partnershipPage.priorities.p1.text") },
    { title: t("partnershipPage.priorities.p2.title"), text: t("partnershipPage.priorities.p2.text") },
    { title: t("partnershipPage.priorities.p3.title"), text: t("partnershipPage.priorities.p3.text") },
  ]

  const option1Steps = [
    t("partnershipPage.join.option1.s1"),
    t("partnershipPage.join.option1.s2"),
    t("partnershipPage.join.option1.s3"),
    t("partnershipPage.join.option1.s4"),
  ]

  const option2Fields = [
    t("partnershipPage.join.option2.f1"),
    t("partnershipPage.join.option2.f2"),
    t("partnershipPage.join.option2.f3"),
    t("partnershipPage.join.option2.f4"),
  ]

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full h-[600px] md:h-[720px] overflow-hidden bg-black">
        {/* Background Image - full width, accepts slight vertical crop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/headerPartnership.png')" }}
        />

        {/* Dark Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/55 md:bg-black/45" />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-2 md:mb-3 drop-shadow-lg">{t("partnershipPage.hero.title")}</h1>
            <p className="text-white/90 text-sm sm:text-base md:text-xl max-w-2xl mx-auto drop-shadow-md">
              {t("partnershipPage.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Intro & Tabs */}
      <section className="py-12 border-b border-[#E9E9E9]" data-tabs-section>
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-6">
          <div>
            <h2 className="text-2xl md:text-[26px] font-semibold text-[#111929]">{t("partnershipPage.intro.title")}</h2>
            <p className="text-[#485A69] text-sm md:text-base mt-3 leading-relaxed">
              {t("partnershipPage.intro.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-5 py-2 rounded-full border ${active === tab.id ? "bg-[#0ABAB5] text-white border-[#0ABAB5]" : "bg-white text-[#00A3A0] border-[#0ABAB5]"
                  } transition-colors`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {active === "overview" && <CentreOverview t={t} cards={overviewCards} />}
      {active === "obligation" && <CentreObligation t={t} items={obligationItems} />}
      {active === "join" && (
        <HowToJoin
          t={t}
          priorities={priorities}
          option1Steps={option1Steps}
          option2Fields={option2Fields}
        />
      )}

      <ReadyCTA t={t} setActive={setActive} />
      <Footer />
    </main>
  )
}

function CentreOverview({ t, cards }: { t: (k: string) => string; cards: { title: string; text: string; image: string }[] }) {
  return (
    <>
      {/* Overview Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/sectionCe.png')" }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10">
            <h3 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">{t("partnershipPage.overview.title")}</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929] mb-3">{t("partnershipPage.overview.subTitle")}</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">
            {t("partnershipPage.overview.subDesc")}
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl overflow-hidden"
            >
              <img src={card.image} alt={card.title} className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      </section>

      {/* Roles Table Section */}
      <section className="pb-16">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111929]">
              {t("partnershipPage.overview.rolesTable.heading")}
            </h2>
            <p className="text-base md:text-lg text-[#111929]">
              {t("partnershipPage.overview.rolesTable.title")}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white border border-[#E9E9E9] rounded-lg">
              <thead>
                <tr className="border-b border-[#E9E9E9]">
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm text-[#111929] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.role")}
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm text-[#111929] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.description")}
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm text-[#111929]">
                    {t("partnershipPage.overview.rolesTable.accessLevel")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E9E9E9]">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#111929] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.owner.role")}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#485A69] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.owner.description")}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#485A69]">
                    {t("partnershipPage.overview.rolesTable.owner.accessLevel")}
                  </td>
                </tr>
                <tr className="border-b border-[#E9E9E9]">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#111929] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.manager.role")}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#485A69] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.manager.description")}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#485A69]">
                    {t("partnershipPage.overview.rolesTable.manager.accessLevel")}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#111929] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.coach.role")}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#485A69] border-r border-[#E9E9E9]">
                    {t("partnershipPage.overview.rolesTable.coach.description")}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#485A69]">
                    {t("partnershipPage.overview.rolesTable.coach.accessLevel")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

function CentreObligation({
  t,
  items,
}: {
  t: (k: string) => string
  items: { badge: string; title: string; description: string; bullets: string[]; image: string }[]
}) {
  const renderBulletText = (text: string, itemIdx: number) => {
    if (itemIdx === 0) {
      // First item: highlight "A class photo" and "Performance feedback"
      if (text.includes("A class photo")) {
        const parts = text.split("A class photo");
        return (
          <>
            <span className="text-[#0ABAB5] font-medium">A class photo</span>
            <span className="text-[#111929]">{parts[1]}</span>
          </>
        );
      }
      if (text.includes("Performance feedback")) {
        const parts = text.split("Performance feedback");
        return (
          <>
            <span className="text-[#0ABAB5] font-medium">Performance feedback</span>
            <span className="text-[#111929]">{parts[1]}</span>
          </>
        );
      }
    }
    return <span className="text-[#111929]">{text}</span>;
  };

  return (
    <>
      {/* Obligation Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/sectionCo.png')" }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10">
            <h3 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">{t("partnershipPage.obligation.title")}</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929] mb-3">{t("partnershipPage.obligation.subTitle")}</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">
            {t("partnershipPage.obligation.subDesc")}
          </p>
        </div>
      </section>

      <section className="pb-16 space-y-12">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 space-y-16">
          {items.map((item, idx) => (
            <div key={item.title} className="grid md:grid-cols-2 gap-8 items-center">
              {idx % 2 === 0 ? (
                <>
                  <div className="rounded-2xl overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-4">
                    <span className="inline-block text-xs font-semibold text-[#00A3A0] bg-[#E7F9F8] px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                    <h4 className="text-2xl md:text-3xl font-semibold text-[#111929]">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm md:text-base text-[#485A69] leading-relaxed">{item.description}</p>
                    )}
                    <ol className="space-y-4 text-sm md:text-base leading-relaxed list-none">
                      {item.bullets.map((b, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-4">
                          <span className="text-2xl font-bold text-[#111929] flex-shrink-0">{String(bulletIdx + 1).padStart(2, '0')}</span>
                          <span className="pt-1">{renderBulletText(b, idx)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <span className="inline-block text-xs font-semibold text-[#00A3A0] bg-[#E7F9F8] px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                    <h4 className="text-2xl md:text-3xl font-semibold text-[#111929]">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm md:text-base text-[#485A69] leading-relaxed">{item.description}</p>
                    )}
                    <ol className="space-y-4 text-sm md:text-base leading-relaxed list-none">
                      {item.bullets.map((b, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-4">
                          <span className="text-2xl font-bold text-[#111929] flex-shrink-0">{String(bulletIdx + 1).padStart(2, '0')}</span>
                          <span className="pt-1">{renderBulletText(b, idx)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </>
              )}
            </div>
          ))}

        </div>
      </section>
    </>
  )
}

function PartnershipPriorities({
  t,
  priorities,
}: {
  t: (k: string) => string
  priorities: { title: string; text: string }[]
}) {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-10 space-y-10">
        {/* Header Area */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0ABAB5] text-white text-sm font-medium">
              <Heart className="w-4 h-4" />
              {t("partnershipPage.priorities.ourFocus")}
            </button>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111929]">
            {t("partnershipPage.priorities.title")}
          </h2>
          <p className="text-base md:text-lg text-[#485A69] max-w-3xl mx-auto">
            {t("partnershipPage.priorities.description")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {priorities.map((p, idx) => {
            const icons = ["/prioty.png", "/listing.png", "/quality.png"]
            return (
              <div key={p.title} className="rounded-2xl bg-white border border-[#E9E9E9] shadow-lg p-6 space-y-4">
                <img
                  src={icons[idx]}
                  alt={p.title}
                  className="w-16 h-16 object-contain"
                />
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-[#111929]">{p.title}</h4>
                  <p className="text-sm text-[#485A69] leading-relaxed">{p.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowToJoin({
  t,
  priorities,
  option1Steps,
  option2Fields,
}: {
  t: (k: string) => string
  priorities: { title: string; text: string }[]
  option1Steps: string[]
  option2Fields: string[]
}) {
  // Form state for Option 2
  const [formData, setFormData] = useState({
    ownerName: "",
    centreName: "",
    email: "",
    phone: "",
    webpageLink: "",
    status: [] as string[],
    interests: [] as string[],
    hearAboutUs: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: 'status' | 'interests' | 'hearAboutUs', value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[]
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] }
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.ownerName || !formData.centreName || !formData.email || !formData.phone) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields (Owner Name, Centre Name, Email, and Phone Number).'
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
      // Format message with all form data
      const statusTexts = formData.status.map(s => 
        s === 'registered' ? t("partnershipPage.join.option2.status1") : t("partnershipPage.join.option2.status2")
      )
      
      const interestTexts = formData.interests.map(key => 
        t(`partnershipPage.join.option2.interest.${key}`)
      )
      
      const hearTexts = formData.hearAboutUs.map(key => 
        t(`partnershipPage.join.option2.hear.${key}`)
      )

      const messageParts = [
        `Centre Owner Name: ${formData.ownerName}`,
        `Centre Name: ${formData.centreName}`,
        `Email: ${formData.email}`,
        `Phone: ${formData.phone}`,
        formData.webpageLink ? `Webpage Link: ${formData.webpageLink}` : '',
        statusTexts.length > 0 ? `Centre Status: ${statusTexts.join(', ')}` : '',
        interestTexts.length > 0 ? `Interests: ${interestTexts.join(', ')}` : '',
        hearTexts.length > 0 ? `How did you hear about us: ${hearTexts.join(', ')}` : ''
      ].filter(Boolean)

      const message = messageParts.join('\n')

      const requestBody = {
        email: formData.email,
        name: formData.ownerName,
        message: message,
        subject: `Centre Request - ${formData.centreName}`,
        category: "partnership"
      }

      // Construct API URL - use Next.js API route if API_BASE_URL is empty
      const apiUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/parent/contact-form`
        : '/api/parent/contact-form' // Next.js API route will proxy to backend
      
      console.log('API_BASE_URL:', API_BASE_URL)
      console.log('Submitting partnership form to:', apiUrl)
      console.log('Request body:', requestBody)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        mode: 'cors', // Enable CORS
      })

      console.log('Response status:', response.status)
      console.log('Response URL:', response.url)

      // Handle 404 specifically
      if (response.status === 404) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('404 Error - Endpoint not found:', errorText)
        setSubmitStatus({
          type: 'error',
          message: `API endpoint not found (404). Please check if the backend is running and the endpoint is correct. URL: ${apiUrl}`
        })
        return
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        setSubmitStatus({
          type: 'error',
          message: `Server error (${response.status}). Please check if the backend is running. Response: ${text.substring(0, 100)}`
        })
        return
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Your centre request has been received. We will review and contact you within 3-5 business days.'
        })
        // Reset form
        setFormData({
          ownerName: "",
          centreName: "",
          email: "",
          phone: "",
          webpageLink: "",
          status: [],
          interests: [],
          hearAboutUs: []
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.message || `Failed to submit your request. (Status: ${response.status})`
        })
      }
    } catch (error: any) {
      console.error('Error submitting form:', error)
      console.error('API_BASE_URL:', API_BASE_URL)
      let errorMessage = 'An error occurred while submitting your request. Please try again later.'
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = `Cannot connect to server. Please check if the backend is running at ${API_BASE_URL}. If you're using a different backend URL, please set NEXT_PUBLIC_API_BASE_URL environment variable.`
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
    <>
      {/* How to Join Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/sectionHTJU.png')" }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10">
            <div className="text-left space-y-2">
              <h3 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
                {t("partnershipPage.join.heroTitle")}
              </h3>
              <p className="text-white text-lg md:text-xl drop-shadow-md">
                {t("partnershipPage.join.heroSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <PartnershipPriorities t={t} priorities={priorities} />

      <section className="py-12 bg-white">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-10 space-y-8">
          <div className="space-y-3">
            <p className="text-base md:text-lg text-[#485A69]">{t("partnershipPage.join.subDesc")}</p>
          </div>
        </div>
      </section>

      <section className="pb-16 bg-white">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-2xl md:text-3xl font-bold text-[#111929]">{t("partnershipPage.join.option1.title")}</h4>
                <p className="text-base md:text-lg text-[#485A69]">{t("partnershipPage.join.option1.desc")}</p>
              </div>
              <ol className="space-y-4 text-base md:text-lg text-[#485A69] leading-relaxed">
                {option1Steps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-[#111929] flex-shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="pt-1 text-[#485A69]">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="text-sm text-[#485A69] pt-2">
                {t("partnershipPage.join.option2.note")}
              </p>
            </div>
            {/* Right side - Image */}
            <div className="flex justify-center lg:justify-end">
              <img src="/option1.png" alt="App onboarding" className="w-full max-w-md lg:max-w-lg object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 bg-white">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-12 md:py-16">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E9E9E9] bg-white shadow-lg p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h4 className="text-2xl md:text-3xl font-bold text-[#111929]">{t("partnershipPage.join.option2.title")}</h4>
              <p className="text-sm text-[#485A69]">{t("partnershipPage.join.option2.desc")}</p>
            </div>

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

            {/* Single column layout - ordered as requested */}
            <div className="space-y-4">
              {/* 1. Full name (Centre owner) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111929]">{t("partnershipPage.join.option2.f1")}</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder={t("partnershipPage.join.option2.f1")}
                  className="w-full h-11 px-4 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                  required
                />
              </div>
              {/* 2. Full name of the centre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111929]">{t("partnershipPage.join.option2.f2")}</label>
                <input
                  type="text"
                  value={formData.centreName}
                  onChange={(e) => handleInputChange('centreName', e.target.value)}
                  placeholder={t("partnershipPage.join.option2.f2")}
                  className="w-full h-11 px-4 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                  required
                />
              </div>
              {/* 3. Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111929]">{t("partnershipPage.join.option2.f3")}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t("partnershipPage.join.option2.f3")}
                  className="w-full h-11 px-4 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                  required
                />
              </div>
              {/* 4. Contact phone number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111929]">{t("partnershipPage.join.option2.f4")}</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t("partnershipPage.join.option2.f4")}
                  className="w-full h-11 px-4 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                  required
                />
              </div>
              {/* 5. Centre status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111929]">{t("partnershipPage.join.option2.statusLabel")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#485A69]">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={formData.status.includes('registered')}
                      onChange={(e) => handleCheckboxChange('status', 'registered', e.target.checked)}
                      className="w-4 h-4 text-[#0ABAB5] focus:ring-[#0ABAB5] rounded border-gray-300 flex-shrink-0" 
                    /> 
                    <span className="break-words">{t("partnershipPage.join.option2.status1")}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={formData.status.includes('individual')}
                      onChange={(e) => handleCheckboxChange('status', 'individual', e.target.checked)}
                      className="w-4 h-4 text-[#0ABAB5] focus:ring-[#0ABAB5] rounded border-gray-300 flex-shrink-0" 
                    /> 
                    <span className="break-words">{t("partnershipPage.join.option2.status2")}</span>
                  </label>
                </div>
              </div>
              {/* 6. Webpage link */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111929]">{t("partnershipPage.join.option2.linkPlaceholder")}</label>
                <input
                  type="text"
                  value={formData.webpageLink}
                  onChange={(e) => handleInputChange('webpageLink', e.target.value)}
                  placeholder={t("partnershipPage.join.option2.linkPlaceholder")}
                  className="w-full h-11 px-4 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                />
              </div>
              {/* 7. Interest in ClassZ */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#111929]">{t("partnershipPage.join.option2.interestTitle")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#485A69]">
                  {["i1", "i2", "i3", "i4", "i5", "i6", "i7"].map((key) => (
                    <label key={key} className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.interests.includes(key)}
                        onChange={(e) => handleCheckboxChange('interests', key, e.target.checked)}
                        className="w-4 h-4 text-[#0ABAB5] focus:ring-[#0ABAB5] rounded border-gray-300 mt-0.5 flex-shrink-0" 
                      /> 
                      <span className="break-words">{t(`partnershipPage.join.option2.interest.${key}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* 8. How did you hear about us */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#111929]">{t("partnershipPage.join.option2.hearTitle")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#485A69]">
                  {["h1", "h2", "h3", "h4", "h5", "h6", "h7"].map((key) => (
                    <label key={key} className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.hearAboutUs.includes(key)}
                        onChange={(e) => handleCheckboxChange('hearAboutUs', key, e.target.checked)}
                        className="w-4 h-4 text-[#0ABAB5] focus:ring-[#0ABAB5] rounded border-gray-300 mt-0.5 flex-shrink-0" 
                      /> 
                      <span className="break-words">{t(`partnershipPage.join.option2.hear.${key}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="min-w-[160px] h-11 rounded-full bg-[#0ABAB5] text-white text-sm font-medium hover:bg-[#00b3a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : t("partnershipPage.join.option2.submit")}
              </button>
            </div>
            <p className="text-xs text-[#485A69] text-center pt-2">
              {t("partnershipPage.join.option2.note")}
            </p>
          </form>
        </div>
      </section>
    </>
  )
}

function ReadyCTA({ t, setActive }: { t: (k: string) => string; setActive: (tab: string) => void }) {
  const handleTabClick = (tabId: string) => {
    setActive(tabId)
    // Scroll to tabs section
    setTimeout(() => {
      const tabsSection = document.querySelector('[data-tabs-section]')
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <section className="py-14 bg-gradient-to-b from-white via-[#F4FBFA] to-[#E7F9F8]">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 text-center space-y-4">
        <h3 className="text-2xl font-semibold text-[#111929]">{t("partnershipPage.cta.title")}</h3>
        <p className="text-sm md:text-base text-[#485A69] max-w-2xl mx-auto">
          {t("partnershipPage.cta.desc")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => handleTabClick("obligation")}
            className="px-5 py-2 rounded-full border border-[#0ABAB5] text-[#00A3A0] hover:bg-[#0ABAB5] hover:text-white transition-colors"
          >
            {t("partnershipPage.cta.linkOverview")}
          </button>
          <button
            onClick={() => handleTabClick("join")}
            className="px-5 py-2 rounded-full bg-[#0ABAB5] text-white hover:bg-[#00b3a3] transition-colors"
          >
            {t("partnershipPage.cta.linkJoin")}
          </button>
        </div>
      </div>
    </section>
  )
}


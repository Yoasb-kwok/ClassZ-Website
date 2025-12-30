"use client"

import React from "react"

interface PolicySectionProps {
  title: string
  content: string
  subsections?: Array<{
    title: string
    content: string
  }>
  processContent?: (text: string, sectionNum?: number) => React.ReactNode
  sectionNum?: number
}

export function PolicySection({
  title,
  content,
  subsections = [],
  processContent,
  sectionNum,
}: PolicySectionProps) {
  const defaultProcessContent = (text: string): React.ReactNode => {
    return text
  }

  const process = processContent || defaultProcessContent

  return (
    <div className="space-y-4 pb-6 border-b border-[#E5E7EB] last:border-b-0">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
        {title}
      </h2>
      {content && (
        <div className="space-y-4 text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
          {process(content, sectionNum)}
        </div>
      )}
      {subsections.length > 0 && (
        <div className="space-y-4 pl-4 md:pl-6">
          {subsections.map((subsection, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                {subsection.title}
              </h3>
              <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                {process(subsection.content, sectionNum)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}








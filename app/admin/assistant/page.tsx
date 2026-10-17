"use client"

import { AssistantChat } from "@/components/admin/assistant-chat"

export default function AdminAssistantPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#111929]">
          AI assistant <span className="text-[#9CA3AF]">AI 助手</span>
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Ask about your schedule, move classes, or arrange substitutes — the
          assistant always shows you a change before making it.
        </p>
        <p className="text-sm text-[#6B7280]">
          查詢排程、移動班級、安排代課 — 每一個更改前，助手都會先讓你確認。
        </p>
      </div>
      <AssistantChat />
    </div>
  )
}

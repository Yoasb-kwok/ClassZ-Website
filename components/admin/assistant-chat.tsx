"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, CircleStop, RotateCcw, SendHorizonal, User } from "lucide-react";
import {
  approveAgentAction,
  sendAgentChat,
  startAgentSession,
  stopAgentAction,
  type AgentApproval,
  type AgentSession,
} from "@/lib/agent-client";
import { ClasszApiError } from "@/lib/classz-api-client";

type ChatMessage =
  | { kind: "text"; from: "user" | "agent"; text: string }
  | {
      kind: "approval";
      approval: AgentApproval;
      state: "pending" | "confirmed" | "dismissed";
    };

const TOOL_LABELS: Record<string, { en: string; zh: string }> = {
  apply_bulk_reschedule: { en: "Move classes", zh: "移動班級" },
  preview_bulk_reschedule: { en: "Check a move plan", zh: "預覽調動方案" },
  assign_substitute: { en: "Arrange a substitute teacher", zh: "安排代課導師" },
  create_class: { en: "Create a class", zh: "新增班級" },
  create_task: { en: "Add a task", zh: "新增任務" },
  update_task: { en: "Update a task", zh: "更新任務" },
};

const ARG_LABELS: Record<string, { en: string; zh: string }> = {
  class_ids: { en: "Classes", zh: "班級" },
  delta_minutes: { en: "Shift by (minutes)", zh: "移動（分鐘）" },
  new_start_times: { en: "New start times", zh: "新的開始時間" },
  strict_holidays: { en: "Treat holidays as blockers", zh: "假期視為阻擋" },
  class_id: { en: "Class", zh: "班級" },
  instructor_id: { en: "Teacher id", zh: "導師 id" },
  instructor: { en: "Teacher", zh: "導師" },
  notify: { en: "Notify families", zh: "通知家長" },
  name: { en: "Name", zh: "名稱" },
  start_time: { en: "Starts", zh: "開始" },
  end_time: { en: "Ends", zh: "結束" },
  location: { en: "Room", zh: "課室" },
  capacity: { en: "Capacity", zh: "名額" },
  title: { en: "Task", zh: "任務" },
  detail: { en: "Detail", zh: "詳情" },
  status: { en: "Status", zh: "狀態" },
  task_id: { en: "Task", zh: "任務" },
};

function humanizeToolName(name: string, zh: boolean): string {
  const label = TOOL_LABELS[name];
  if (label) return zh ? label.zh : label.en;
  return name.replace(/_/g, " ");
}

function formatArgValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

function humanizeArgKey(key: string, zh: boolean): string {
  const label = ARG_LABELS[key];
  if (label) return zh ? label.zh : label.en;
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function useLanguage() {
  const [zh, setZh] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("locale") || "";
    setZh(stored.startsWith("zh"));
  }, []);
  return zh;
}

export function AssistantChat() {
  const zh = useLanguage();
  const [session, setSession] = useState<AgentSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = (en: string, zhText: string) => (zh ? zhText : en);

  const ensureSession = useCallback(async (): Promise<AgentSession> => {
    if (session) return session;
    setStarting(true);
    try {
      const s = await startAgentSession();
      setSession(s);
      setSessionError(null);
      return s;
    } catch (e) {
      const msg =
        e instanceof ClasszApiError
          ? e.message
          : "Could not reach the assistant. Is classz-api running?";
      setSessionError(msg);
      throw e;
    } finally {
      setStarting(false);
    }
  }, [session]);

  const startNewConversation = useCallback(async () => {
    setMessages([]);
    setError(null);
    setSessionError(null);
    setStarting(true);
    try {
      const s = await startAgentSession();
      setSession(s);
    } catch (e) {
      setSessionError(
        e instanceof ClasszApiError
          ? e.message
          : "Could not reach the assistant. Is classz-api running?",
      );
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  // Mint the agent session on mount so the input is ready to type in.
  useEffect(() => {
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      try {
        await fn();
      } catch (e) {
        if (
          e instanceof ClasszApiError &&
          (e.status === 401 || e.status === 404)
        ) {
          // Expired agent session — drop it so the next send mints a new one.
          setSession(null);
          setError(
            t(
              "The assistant session expired. Send your message again.",
              "助手連線已過期，請重新傳送訊息。",
            ),
          );
        } else {
          setError(
            e instanceof ClasszApiError
              ? e.message
              : t(
                  "Something went wrong. Please try again.",
                  "出了點問題，請再試一次。",
                ),
          );
        }
      } finally {
        setBusy(false);
      }
    },
    [t],
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { kind: "text", from: "user", text }]);
    run(async () => {
      const s = await ensureSession();
      const result = await sendAgentChat(s, text);
      setMessages((m) => [
        ...m,
        ...(result.reply
          ? [{ kind: "text", from: "agent", text: result.reply } as ChatMessage]
          : []),
        ...(result.status === "pending_approval" && result.pending_approval
          ? [
              {
                kind: "approval",
                approval: result.pending_approval,
                state: "pending",
              } as ChatMessage,
            ]
          : []),
      ]);
    });
  }, [input, busy, run, ensureSession]);

  const handleApprove = useCallback(
    (approval: AgentApproval) => {
      run(async () => {
        const s = await ensureSession();
        const result = await approveAgentAction(s, approval.id);
        setMessages((m) =>
          m.map((msg): ChatMessage =>
            msg.kind === "approval" && msg.approval.id === approval.id
              ? { ...msg, state: "confirmed" }
              : msg,
          ),
        );
        setMessages((m) => [
          ...m,
          ...(result.reply
            ? [
                {
                  kind: "text",
                  from: "agent",
                  text: result.reply,
                } as ChatMessage,
              ]
            : []),
          ...(result.status === "pending_approval" && result.pending_approval
            ? [
                {
                  kind: "approval",
                  approval: result.pending_approval,
                  state: "pending",
                } as ChatMessage,
              ]
            : []),
        ]);
      });
    },
    [run, ensureSession],
  );

  const handleDismiss = useCallback(
    (approval: AgentApproval) => {
      run(async () => {
        const s = await ensureSession();
        await stopAgentAction(s);
        setMessages((m) => [
          ...m.map((msg): ChatMessage =>
            msg.kind === "approval" && msg.approval.id === approval.id
              ? { ...msg, state: "dismissed" }
              : msg,
          ),
          {
            kind: "text",
            from: "agent",
            text: t("No changes were made.", "沒有進行任何更改。"),
          },
        ]);
      });
    },
    [run, ensureSession, t],
  );

  const pendingCount = messages.filter(
    (m) => m.kind === "approval" && m.state === "pending",
  ).length;

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[520px] flex-col rounded-2xl border border-[#E5E7EB] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00A3A0] text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#111929]">
              {t("Centre assistant", "中心助手")}
            </div>
            <div className="text-xs text-[#6B7280]">
              {t(
                "Scheduling, conflicts, substitutes and centre questions",
                "排程、衝突、代課與中心查詢",
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={startNewConversation}
          disabled={busy || starting}
          className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#4B5563] transition hover:border-[#00A3A0] hover:text-[#00A3A0] disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("New conversation", "新對話")}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {starting && !sessionError && messages.length === 0 && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-classz-400 border-t-transparent" />
          </div>
        )}

        {!starting && messages.length === 0 && (
          <div className="mx-auto max-w-md py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F8F7]">
              <Bot className="h-6 w-6 text-[#00A3A0]" />
            </div>
            <p className="text-sm font-medium text-[#111929]">
              {t("Hi! I'm your centre assistant.", "你好！我是你的中心助手。")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {t(
                'Ask me about your schedule — "What classes do I have this week?", "Move Monday\'s piano class to 6 pm", or "Ada can\'t teach Thursday, who can substitute?"',
                "問我排程的事 — 「這星期有哪些班？」、「把星期一的鋼琴班移到 6 pm」、「Ada 星期四不能上課，誰可以代課？」",
              )}
            </p>
          </div>
        )}

        {sessionError && (
          <div className="mx-auto max-w-md rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
            {sessionError}
          </div>
        )}

        {messages.map((msg, i) =>
          msg.kind === "text" ? (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${msg.from === "user" ? "justify-end" : ""}`}
            >
              {msg.from === "agent" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00A3A0] text-white">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "rounded-tr-sm bg-[#00A3A0] text-white"
                    : "rounded-tl-sm bg-[#F3F4F6] text-[#111929]"
                }`}
              >
                {msg.text}
              </div>
              {msg.from === "user" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E7F8F7] text-[#044A48]">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ) : (
            <ApprovalCard
              key={i}
              approval={msg.approval}
              state={msg.state}
              zh={zh}
              disabled={busy}
              onApprove={() => handleApprove(msg.approval)}
              onDismiss={() => handleDismiss(msg.approval)}
            />
          ),
        )}

        {busy && (
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00A3A0] text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#F3F4F6] px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        className="flex items-center gap-2 border-t border-[#E5E7EB] px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("Ask about your schedule…", "詢問排程…")}
          disabled={busy || starting}
          className="flex-1 rounded-full border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111929] placeholder-[#9CA3AF] focus:border-[#00A3A0] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || starting || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00A3A0] text-white transition hover:bg-[#008f8a] disabled:opacity-40"
          aria-label={t("Send", "傳送")}
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function ApprovalCard({
  approval,
  state,
  zh,
  disabled,
  onApprove,
  onDismiss,
}: {
  approval: AgentApproval;
  state: "pending" | "confirmed" | "dismissed";
  zh: boolean;
  disabled: boolean;
  onApprove: () => void;
  onDismiss: () => void;
}) {
  const entries = Object.entries(approval.args || {}).filter(
    ([, v]) =>
      v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0),
  );

  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00A3A0] text-white">
        <Bot className="h-4 w-4" />
      </div>
      <div className="w-full max-w-[85%] rounded-2xl rounded-tl-sm border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3.5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#92400E]">
            {zh ? "待確認的更改" : "Change waiting for your confirmation"}
          </span>
          {state !== "pending" && (
            <span
              className={`text-xs font-semibold ${
                state === "confirmed" ? "text-[#3FB950]" : "text-[#6B7280]"
              }`}
            >
              {state === "confirmed"
                ? zh
                  ? "已執行 ✓"
                  : "Applied ✓"
                : zh
                  ? "已取消"
                  : "Dismissed"}
            </span>
          )}
        </div>
        <div className="text-sm font-semibold text-[#111929]">
          {humanizeToolName(approval.tool_name, zh)}
        </div>
        {entries.length > 0 && (
          <dl className="mt-2 space-y-1 text-sm">
            {entries.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="min-w-[110px] shrink-0 text-[#6B7280]">
                  {humanizeArgKey(key, zh)}
                </dt>
                <dd className="break-all font-medium text-[#111929]">
                  {formatArgValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {state === "pending" && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onApprove}
              disabled={disabled}
              className="rounded-full bg-[#00A3A0] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#008f8a] disabled:opacity-40"
            >
              {zh ? "確認執行" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-full border border-[#D1D5DB] px-4 py-1.5 text-sm font-medium text-[#4B5563] transition hover:bg-[#F3F4F6] disabled:opacity-40"
            >
              <CircleStop className="h-3.5 w-3.5" />
              {zh ? "取消" : "Dismiss"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

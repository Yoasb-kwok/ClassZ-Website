"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  CircleStop,
  MessageSquarePlus,
  SendHorizonal,
  Trash2,
  User,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  approveAgentAction,
  deleteAgentThread,
  getAgentThread,
  listAgentThreads,
  sendAgentChat,
  startAgentSession,
  stopAgentAction,
  type AgentApproval,
  type AgentSession,
  type AgentThreadSummary,
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

/** History messages (user/assistant text only) → display model. */
function historyToChatMessages(
  msgs: { role: string; content: string | null }[],
): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of msgs) {
    if (m.role === "user" && m.content) {
      out.push({ kind: "text", from: "user", text: m.content });
    } else if (m.role === "assistant" && m.content) {
      out.push({ kind: "text", from: "agent", text: m.content });
    }
  }
  return out;
}

function relativeTime(iso: string, zh: boolean): string {
  const then = new Date(iso).getTime();
  const diffMins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (diffMins < 1) return zh ? "剛剛" : "just now";
  if (diffMins < 60) return zh ? `${diffMins} 分鐘前` : `${diffMins}m ago`;
  const hours = Math.floor(diffMins / 60);
  if (hours < 24) return zh ? `${hours} 小時前` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return zh ? `${days} 天前` : `${days}d ago`;
}

export function AssistantChat() {
  const { locale } = useLanguage();
  const zh = String(locale).startsWith("zh");
  const t = (en: string, zhText: string) => (zh ? zhText : en);

  const [session, setSession] = useState<AgentSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  const [threads, setThreads] = useState<AgentThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newConversation, setNewConversation] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // delete flow: first confirm on the item, second confirm in the dialog
  const [deleteTarget, setDeleteTarget] = useState<AgentThreadSummary | null>(
    null,
  );

  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshThreads = useCallback(async (s: AgentSession) => {
    try {
      setThreads(await listAgentThreads(s));
    } catch {
      /* sidebar refresh is best-effort */
    }
  }, []);

  // Mint + load the thread list on mount; auto-open the most recent thread.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStarting(true);
      try {
        const s = await startAgentSession();
        if (cancelled) return;
        setSession(s);
        setThreads(s.threads ?? []);
        if ((s.threads ?? []).length > 0) {
          const latest = (s.threads ?? [])[0];
          try {
            const detail = await getAgentThread(s, latest.id);
            if (!cancelled) {
              setMessages(historyToChatMessages(detail.messages));
              setActiveThreadId(latest.id);
            }
          } catch {
            /* thread failed to load — leave empty state */
          }
        }
        setSessionError(null);
      } catch (e) {
        if (!cancelled) {
          setSessionError(
            e instanceof ClasszApiError
              ? e.message
              : "Could not reach the assistant. Is classz-api running?",
          );
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const ensureSession = useCallback(async (): Promise<AgentSession> => {
    if (session) return session;
    const s = await startAgentSession();
    setSession(s);
    setSessionError(null);
    return s;
  }, [session]);

  const startNewConversation = useCallback(() => {
    // Lazy creation: no DB row until the first message is sent.
    setActiveThreadId(null);
    setMessages([]);
    setError(null);
    setNewConversation(true);
  }, []);

  const openThread = useCallback(
    (threadId: string) => {
      if (busy) return;
      run(async () => {
        const s = await ensureSession();
        const detail = await getAgentThread(s, threadId);
        setActiveThreadId(threadId);
        setNewConversation(false);
        setMessages(historyToChatMessages(detail.messages));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, ensureSession],
  );

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
          setSession(null); // re-mint on the next action
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
    setNewConversation(false);
    run(async () => {
      const s = await ensureSession();
      const result = await sendAgentChat(s, activeThreadId, text);
      if (!activeThreadId) setActiveThreadId(result.thread_id);
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
      refreshThreads(s);
    });
  }, [input, busy, run, ensureSession, activeThreadId, refreshThreads]);

  const handleApprove = useCallback(
    (approval: AgentApproval) => {
      if (!activeThreadId) return;
      run(async () => {
        const s = await ensureSession();
        const result = await approveAgentAction(s, activeThreadId, approval.id);
        setMessages((m) =>
          m.map((msg): ChatMessage => {
            if (msg.kind === "approval" && msg.approval.id === approval.id) {
              return { ...msg, state: "confirmed" };
            }
            return msg;
          }),
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
        ]);
        refreshThreads(s);
      });
    },
    [run, ensureSession, activeThreadId, refreshThreads],
  );

  const handleDismiss = useCallback(
    (approval: AgentApproval) => {
      if (!activeThreadId) return;
      run(async () => {
        const s = await ensureSession();
        await stopAgentAction(s, activeThreadId);
        setMessages((m) => [
          ...m.map((msg): ChatMessage => {
            if (msg.kind === "approval" && msg.approval.id === approval.id) {
              return { ...msg, state: "dismissed" };
            }
            return msg;
          }),
          {
            kind: "text",
            from: "agent",
            text: t("No changes were made.", "沒有進行任何更改。"),
          },
        ]);
      });
    },
    [run, ensureSession, activeThreadId, t],
  );

  const handleDelete = useCallback(
    async (thread: AgentThreadSummary) => {
      setDeleteTarget(null);
      try {
        const s = await ensureSession();
        await deleteAgentThread(s, thread.id);
        setThreads(await listAgentThreads(s));
        if (activeThreadId === thread.id) {
          setActiveThreadId(null);
          setMessages([]);
          setNewConversation(true);
        }
      } catch (e) {
        setError(
          e instanceof ClasszApiError
            ? e.message
            : t("Could not delete the conversation.", "無法刪除此對話。"),
        );
      }
    },
    [ensureSession, activeThreadId, t],
  );

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[560px] gap-4">
      {/* Sidebar */}
      <div className="flex w-64 shrink-0 flex-col rounded-2xl border border-[#E5E7EB] bg-white">
        <button
          type="button"
          onClick={startNewConversation}
          disabled={busy || starting}
          className="m-3 flex items-center justify-center gap-2 rounded-xl border border-[#00A3A0] px-3 py-2 text-sm font-semibold text-[#00A3A0] transition hover:bg-[#E7F8F7] disabled:opacity-50"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {t("New conversation", "新對話")}
        </button>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {threads.length === 0 && (
            <p className="px-3 py-4 text-xs text-[#9CA3AF]">
              {t("No past conversations yet.", "暫無過往對話。")}
            </p>
          )}
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`group mb-1 flex items-center gap-1 rounded-xl px-2 py-2 transition ${
                thread.id === activeThreadId && !newConversation
                  ? "bg-[#E7F8F7]"
                  : "hover:bg-[#F3F4F6]"
              }`}
            >
              <button
                type="button"
                onClick={() => openThread(thread.id)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate text-[13px] font-medium text-[#111929]">
                  {thread.title}
                </div>
                <div className="text-[11px] text-[#9CA3AF]">
                  {relativeTime(thread.updatedAt, zh)}
                </div>
              </button>
              <button
                type="button"
                aria-label={t("Delete conversation", "刪除對話")}
                onClick={() => setDeleteTarget(thread)}
                className="rounded-lg p-1.5 text-[#9CA3AF] opacity-0 transition hover:bg-[#FEF2F2] hover:text-[#B91C1C] group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-[#E5E7EB] bg-white">
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
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {starting && (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-classz-400 border-t-transparent" />
            </div>
          )}

          {!starting && messages.length === 0 && !sessionError && (
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F8F7]">
                <Bot className="h-6 w-6 text-[#00A3A0]" />
              </div>
              <p className="text-sm font-medium text-[#111929]">
                {t(
                  "Hi! I'm your centre assistant.",
                  "你好！我是你的中心助手。",
                )}
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

      {/* Delete double-confirm */}
      {deleteTarget && (
        <DeleteConfirmDialog
          thread={deleteTarget}
          zh={zh}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
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

function DeleteConfirmDialog({
  thread,
  zh,
  onCancel,
  onConfirm,
}: {
  thread: AgentThreadSummary;
  zh: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [stage, setStage] = useState<1 | 2>(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {stage === 1 ? (
          <>
            <h3 className="text-base font-semibold text-[#111929]">
              {zh ? "刪除這個對話？" : "Delete this conversation?"}
            </h3>
            <p className="mt-2 truncate text-sm text-[#6B7280]">
              “{thread.title}”
            </p>
            <p className="mt-3 text-sm text-[#6B7280]">
              {zh ? "此操作無法復原。" : "This action cannot be undone."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                {zh ? "取消" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => setStage(2)}
                className="rounded-full bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#991b1b]"
              >
                {zh ? "繼續刪除" : "Continue"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-[#B91C1C]">
              {zh ? "確定要永久刪除？" : "Delete permanently?"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {zh
                ? "此對話將對中心的所有人永久刪除，且無法復原。注意：對話中已執行的操作（例如已移動的班級）不會被復原。"
                : "This conversation will be permanently removed for everyone at your centre and cannot be recovered. Note: actions already taken during the conversation (classes moved, etc.) are NOT undone."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                {zh ? "保留對話" : "Keep it"}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-full bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#991b1b]"
              >
                {zh ? "永久刪除" : "Delete permanently"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

/**
 * Client for the ClassZ agent endpoints (/api/agent/*).
 *
 * Two-token flow:
 *   - the admin's normal session JWT mints the agent token (POST /session)
 *   - the minted short-lived agent token drives threads / chat / approve / stop
 *
 * Threads are PERSISTED per centre and shared by the centre's admins — the
 * sidebar lists them, reopening one rehydrates the conversation, deletion is
 * a hard delete behind a double-confirm.
 */

import { getClasszSession, isDemoTokenSession } from "@/lib/classz-auth";
import { ClasszApiError, type ApiResult } from "@/lib/classz-api-client";

export type AgentApproval = {
  id: string;
  tool_name: string;
  args: Record<string, unknown>;
};

export type AgentThreadSummary = {
  id: string;
  title: string;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentChatResult = {
  status: "done" | "pending_approval" | "max_turns";
  reply: string | null;
  approval?: AgentApproval;
  thread_id: string;
  pending_approval: AgentApproval | null;
};

export type AgentSession = {
  agent_token: string;
  centre_id: number;
  threads: AgentThreadSummary[];
};

export type AgentThreadDetail = {
  thread: {
    id: string;
    title: string;
    centre_id: number;
    pending_approval: AgentApproval | null;
  };
  messages: { role: string; content: string | null }[];
};

function requireSessionToken(): string {
  const session = getClasszSession();
  if (!session?.token || isDemoTokenSession()) {
    throw new ClasszApiError(
      "Sign in with a real centre admin account to use the assistant.",
      401,
      {},
    );
  }
  return session.token;
}

async function agentFetch<T>(
  path: string,
  agentToken: string | null,
  body?: unknown,
  method: "GET" | "POST" | "DELETE" = body === undefined ? "GET" : "POST",
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  headers.Authorization = `Bearer ${agentToken ?? requireSessionToken()}`;
  const res = await fetch(`/api/agent${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const payload = (await res.json().catch(() => ({}))) as ApiResult<T>;
  if (!res.ok) {
    throw new ClasszApiError(
      payload.msg || payload.message || `HTTP ${res.status}`,
      res.status,
      payload,
    );
  }
  return payload.data as T;
}

/** Mint an agent token + load the centre's existing thread list. */
export async function startAgentSession(): Promise<AgentSession> {
  return agentFetch<AgentSession>("/session", null, {}, "POST");
}

export async function listAgentThreads(
  session: AgentSession,
): Promise<AgentThreadSummary[]> {
  const data = await agentFetch<{ threads: AgentThreadSummary[] }>(
    "/threads",
    session.agent_token,
  );
  return data.threads ?? [];
}

export async function getAgentThread(
  session: AgentSession,
  threadId: string,
): Promise<AgentThreadDetail> {
  return agentFetch<AgentThreadDetail>(
    `/threads/${encodeURIComponent(threadId)}`,
    session.agent_token,
  );
}

export async function deleteAgentThread(
  session: AgentSession,
  threadId: string,
): Promise<void> {
  await agentFetch(
    `/threads/${encodeURIComponent(threadId)}`,
    session.agent_token,
    undefined,
    "DELETE",
  );
}

/** One user exchange on a thread (thread_id omitted → creates a new thread). */
export async function sendAgentChat(
  session: AgentSession,
  threadId: string | null,
  message: string,
): Promise<AgentChatResult> {
  return agentFetch<AgentChatResult>("/chat", session.agent_token, {
    thread_id: threadId,
    message,
  });
}

/** Confirm the pending change (single-use approval id). */
export async function approveAgentAction(
  session: AgentSession,
  threadId: string,
  approvalId: string,
): Promise<AgentChatResult> {
  return agentFetch<AgentChatResult>("/approve", session.agent_token, {
    thread_id: threadId,
    approval_id: approvalId,
  });
}

/** Dismiss the pending change — nothing was made. */
export async function stopAgentAction(
  session: AgentSession,
  threadId: string,
): Promise<void> {
  await agentFetch("/stop", session.agent_token, { thread_id: threadId });
}

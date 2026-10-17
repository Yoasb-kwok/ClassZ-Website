"use client";

/**
 * Client for the ClassZ agent endpoints (/api/agent/*).
 *
 * Two-token flow:
 *   - the admin's normal session JWT mints the agent session (POST /session)
 *   - the minted short-lived agent token drives chat / approve / stop / history
 *
 * Lives outside lib/classz-api-client.ts because agent paths are NOT role-prefixed
 * (the client's resolveRequest would turn /agent/x into /center/agent/x).
 */

import { getClasszSession, isDemoTokenSession } from "@/lib/classz-auth";
import { ClasszApiError, type ApiResult } from "@/lib/classz-api-client";

export type AgentApproval = {
  id: string;
  tool_name: string;
  args: Record<string, unknown>;
};

export type AgentChatResult = {
  status: "done" | "pending_approval" | "max_turns";
  reply: string | null;
  approval?: AgentApproval;
  session_id: string;
  centre_id: number;
  pending_approval: AgentApproval | null;
};

export type AgentSession = {
  agent_token: string;
  session_id: string;
  centre_id: number;
};

export type AgentHistoryMessage = {
  role: string;
  content: string | null;
  tool_calls?: unknown[];
  tool_call_id?: string;
};

export type AgentIdentity = {
  email: string | undefined;
  name: string | undefined;
  role: string | undefined;
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
  method: "GET" | "POST" = body === undefined ? "GET" : "POST",
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

/** Mint an agent session (short-lived token) from the signed-in centre admin. */
export async function startAgentSession(): Promise<AgentSession> {
  return agentFetch<AgentSession>("/session", null, {}, "POST");
}

/** One user exchange. Returns the reply, or a pending approval to render. */
export async function sendAgentChat(
  session: AgentSession,
  message: string,
): Promise<AgentChatResult> {
  return agentFetch<AgentChatResult>("/chat", session.agent_token, {
    session_id: session.session_id,
    message,
  });
}

/** Confirm the pending change (single-use approval id). */
export async function approveAgentAction(
  session: AgentSession,
  approvalId: string,
): Promise<AgentChatResult> {
  return agentFetch<AgentChatResult>("/approve", session.agent_token, {
    session_id: session.session_id,
    approval_id: approvalId,
  });
}

/** Dismiss the pending change — nothing was made. */
export async function stopAgentAction(session: AgentSession): Promise<void> {
  await agentFetch("/stop", session.agent_token, {
    session_id: session.session_id,
  });
}

export async function getAgentHistory(
  session: AgentSession,
): Promise<AgentHistoryMessage[]> {
  const data = await agentFetch<{ messages: AgentHistoryMessage[] }>(
    `/history/${encodeURIComponent(session.session_id)}`,
    session.agent_token,
  );
  return data.messages ?? [];
}

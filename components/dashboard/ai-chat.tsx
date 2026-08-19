"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────── */
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
}

interface UserProfile {
  name?: string;
  email?: string;
  first_time?: boolean;
}

/* ── Helpers ───────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2);
}

/* ── Typing indicator ──────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--info)" }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/* ── Message bubble ────────────────────────────────────────── */
function Bubble({ message }: { message: Message }) {
  const isAI = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}
    >
      {/* AI avatar */}
      {isAI && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "color-mix(in oklab, var(--info) 12%, transparent)", border: "1px solid color-mix(in oklab, var(--info) 20%, transparent)" }}
        >
          <Sparkles size={14} style={{ color: "var(--info)" }} />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isAI
            ? "rounded-tl-sm"
            : "rounded-tr-sm"
        )}
        style={
          isAI
            ? {
                backgroundColor: "var(--app-surface-hover)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }
            : {
                backgroundColor: "var(--info)",
                color: "#ffffff",
                fontWeight: 500,
              }
        }
      >
        {message.streaming && message.content === "" ? (
          <TypingDots />
        ) : (
          <>
            {message.content}
            {message.streaming && (
              <motion.span
                className="ml-0.5 inline-block h-3.5 w-0.5 rounded-full align-middle"
                style={{ backgroundColor: isAI ? "var(--info)" : "#ffffff" }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </>
        )}
      </div>

      {/* User avatar */}
      {!isAI && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
        >
          <User size={14} style={{ color: "var(--muted-foreground)" }} />
        </div>
      )}
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export function AIChat({
  userProfile,
  endpoint = "/api/chat",
}: {
  userProfile: UserProfile;
  /** BFF endpoint to stream from. Default ARIA/Coach; pass "/api/atencion" for el agente de atención al cliente. */
  endpoint?: string;
}) {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [initialized, setInit]      = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);
  const abortRef                    = useRef<AbortController | null>(null);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Stream a response from Claude ─────────────────────── */
  const streamResponse = useCallback(
    async (history: Array<{ role: Role; content: string }>) => {
      setLoading(true);
      abortRef.current = new AbortController();

      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, userProfile }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error("API error");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") break;
            try {
              const { text } = JSON.parse(payload) as { text: string };
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + text }
                    : m
                )
              );
            } catch {}
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "Ocurrió un error. Intentá de nuevo.", streaming: false }
                : m
            )
          );
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m
          )
        );
        setLoading(false);
      }
    },
    [userProfile, endpoint]
  );

  /* ── Auto-greeting on mount ─────────────────────────────── */
  useEffect(() => {
    if (initialized) return;
    setInit(true);
    streamResponse([
      {
        role: "user",
        content: userProfile.first_time
          ? "__SYSTEM_INIT_FIRST_TIME__"
          : "__SYSTEM_INIT_RETURNING__",
      },
    ]);
  }, [initialized, streamResponse, userProfile.first_time]);

  /* ── Send user message ──────────────────────────────────── */
  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { id: uid(), role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    const history = nextMessages
      .filter((m) => !m.content.startsWith("__SYSTEM_INIT"))
      .map((m) => ({ role: m.role, content: m.content }));

    await streamResponse(history);
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div
      className="flex flex-col"
      style={{
        height: "calc(100svh - 56px)", /* subtract top bar */
        backgroundColor: "var(--app-canvas)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-6 py-3 shrink-0"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-topbar)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "color-mix(in oklab, var(--info) 12%, transparent)", border: "1px solid color-mix(in oklab, var(--info) 25%, transparent)" }}
        >
          <Sparkles size={14} style={{ color: "var(--info)" }} />
        </div>
        <div>
          <p className="font-headline text-sm font-bold" style={{ color: "var(--foreground)" }}>
            ARIA
          </p>
          <div className="flex items-center gap-1.5">
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--info)" }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
              AI OS — En línea
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 md:px-8 lg:px-16 xl:px-32">
        {messages
          .filter((m) => !m.content.startsWith("__SYSTEM_INIT"))
          .map((message) => (
            <Bubble key={message.id} message={message} />
          ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 border-t px-4 py-4 md:px-8 lg:px-16 xl:px-32"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-canvas)" }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl border p-3 transition-all"
          style={{
            borderColor: input ? "color-mix(in oklab, var(--info) 35%, transparent)" : "var(--border)",
            backgroundColor: "var(--app-surface-hover)",
            boxShadow: input ? "0 0 0 1px color-mix(in oklab, var(--info) 10%, transparent)" : "none",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribí tu mensaje…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:opacity-30 disabled:opacity-50"
            style={{
              color: "var(--foreground)",
              maxHeight: "120px",
              lineHeight: "1.5",
            }}
          />
          <motion.button
            type="button"
            onClick={send}
            disabled={!input.trim() || loading}
            whileHover={input.trim() && !loading ? { scale: 1.06 } : {}}
            whileTap={{ scale: 0.94 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
            style={{
              backgroundColor: input.trim() ? "var(--info)" : "var(--muted)",
              color: input.trim() ? "#ffffff" : "var(--muted-foreground)",
            }}
          >
            <Send size={15} />
          </motion.button>
        </div>
        <p
          className="mt-2 text-center font-label text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(144,144,151,0.5)" }}
        >
          Enter para enviar · Shift+Enter nueva línea
        </p>
      </div>
    </div>
  );
}

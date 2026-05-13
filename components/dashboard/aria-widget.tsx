"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, ChevronDown } from "lucide-react";

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
  first_time?: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

/* ── Typing dots ───────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "#3b82f6" }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/* ── Main widget ───────────────────────────────────────────── */
export function AriaWidget({ userProfile }: { userProfile: UserProfile }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [greeted, setGreeted]   = useState(false);
  const [hasNew, setHasNew]     = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Stream ─────────────────────────────────────────────── */
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
        const res = await fetch("/api/chat", {
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
                  m.id === assistantId ? { ...m, content: m.content + text } : m
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
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
        );
        setLoading(false);
      }
    },
    [userProfile]
  );

  /* ── Auto-greeting on mount ─────────────────────────────── */
  useEffect(() => {
    if (greeted) return;
    setGreeted(true);

    // Small delay so the page settles before greeting
    const timer = setTimeout(async () => {
      setHasNew(true);
      await streamResponse([
        {
          role: "user",
          content: userProfile.first_time
            ? "__SYSTEM_INIT_FIRST_TIME__"
            : "__SYSTEM_INIT_RETURNING__",
        },
      ]);
    }, 900);

    return () => clearTimeout(timer);
  }, [greeted, streamResponse, userProfile.first_time]);

  /* ── Auto-open panel on first greeting ─────────────────── */
  useEffect(() => {
    if (messages.length === 1 && !open) {
      setOpen(true);
    }
  }, [messages.length, open]);

  /* ── Send ───────────────────────────────────────────────── */
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

  function handleOpen() {
    setOpen(true);
    setHasNew(false);
  }

  const visibleMessages = messages.filter(
    (m) => !m.content.startsWith("__SYSTEM_INIT")
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{
              width: "360px",
              height: "480px",
              backgroundColor: "#080812",
              border: "1px solid rgba(69,70,77,0.5)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.05)",
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ backgroundColor: "#0c0c14", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}
                >
                  <Sparkles size={12} style={{ color: "#3b82f6" }} />
                </div>
                <div>
                  <p className="font-headline text-xs font-bold" style={{ color: "#f1f5f9" }}>
                    ARIA
                  </p>
                  <div className="flex items-center gap-1">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "#3b82f6" }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-label text-[9px] uppercase tracking-widest" style={{ color: "#334155" }}>
                      En línea
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                style={{ color: "#64748b" }}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4">
              {visibleMessages.map((msg) => {
                const isAI = msg.role === "assistant";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-2 ${isAI ? "justify-start" : "justify-end"}`}
                  >
                    {isAI && (
                      <div
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
                      >
                        <Sparkles size={10} style={{ color: "#3b82f6" }} />
                      </div>
                    )}
                    <div
                      className="max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                      style={
                        isAI
                          ? { backgroundColor: "#10101c", color: "#f1f5f9", borderRadius: "4px 16px 16px 16px" }
                          : { backgroundColor: "#3b82f6", color: "#ffffff", fontWeight: 500, borderRadius: "16px 4px 16px 16px" }
                      }
                    >
                      {msg.streaming && msg.content === "" ? (
                        <TypingDots />
                      ) : (
                        <>
                          {msg.content}
                          {msg.streaming && (
                            <motion.span
                              className="ml-0.5 inline-block h-3 w-0.5 rounded-full align-middle"
                              style={{ backgroundColor: isAI ? "#3b82f6" : "#ffffff" }}
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.7, repeat: Infinity }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="shrink-0 px-3 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="flex items-end gap-2 rounded-xl border p-2 transition-all"
                style={{
                  borderColor: input ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.10)",
                  backgroundColor: "#10101c",
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
                  className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:opacity-30 disabled:opacity-40"
                  style={{ color: "#f1f5f9", maxHeight: "80px", lineHeight: "1.5" }}
                />
                <motion.button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || loading}
                  whileHover={input.trim() && !loading ? { scale: 1.08 } : {}}
                  whileTap={{ scale: 0.92 }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-30"
                  style={{
                    backgroundColor: input.trim() ? "#3b82f6" : "#222a3d",
                    color: input.trim() ? "#ffffff" : "#64748b",
                  }}
                >
                  <Send size={13} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — ARIA avatar button */}
      <motion.button
        onClick={open ? () => setOpen(false) : handleOpen}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl"
        style={{
          backgroundColor: "#3b82f6",
          boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
        }}
        aria-label="Abrir ARIA"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} style={{ color: "#ffffff" }} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles size={20} style={{ color: "#ffffff" }} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* New message dot */}
        <AnimatePresence>
          {hasNew && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2"
              style={{ backgroundColor: "#ef4444", borderColor: "#060609" }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

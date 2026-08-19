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
          className="block size-1.5 rounded-full bg-info"
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

  /* ── Saludo al abrir ─────────────────────────────────────
   * El saludo se genera cuando la persona ABRE el panel, no al cargar la
   * página. Antes se disparaba solo y además abría el panel encima del
   * contenido en cada carga: para quien entra a mirar sus métricas, eso es una
   * interrupción, no una bienvenida. El botón queda visible y disponible; ARIA
   * habla cuando la llaman.
   */
  useEffect(() => {
    if (!open || greeted) return;
    setGreeted(true);
    void streamResponse([
      {
        role: "user",
        content: userProfile.first_time
          ? "__SYSTEM_INIT_FIRST_TIME__"
          : "__SYSTEM_INIT_RETURNING__",
      },
    ]);
  }, [open, greeted, streamResponse, userProfile.first_time]);

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
            className="flex flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-2xl"
            style={{ width: "360px", height: "480px" }}
          >
            {/* Cabecera del panel */}
            <div className="flex shrink-0 items-center justify-between border-b border-app-border bg-app-surface-hover px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-full border border-info/25 bg-info/12">
                  <Sparkles size={12} className="text-info" />
                </div>
                <div>
                  <p className="font-headline text-xs font-bold text-foreground">ARIA</p>
                  <div className="flex items-center gap-1">
                    {/* Verde, no azul: "en línea" es un estado de salud, y el
                        azul acá compite con el color de marca del avatar. */}
                    <motion.span
                      className="size-1.5 rounded-full bg-success"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-label text-[9px] uppercase tracking-widest text-muted-foreground">
                      En línea
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-app-surface hover:text-foreground"
                aria-label="Minimizar ARIA"
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
                      <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-info/20 bg-info/10">
                        <Sparkles size={10} className="text-info" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3 py-2 text-sm leading-relaxed ${
                        isAI
                          ? "bg-app-surface-hover text-foreground"
                          : "bg-info font-medium text-white"
                      }`}
                      style={{
                        borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                      }}
                    >
                      {msg.streaming && msg.content === "" ? (
                        <TypingDots />
                      ) : (
                        <>
                          {msg.content}
                          {msg.streaming && (
                            <motion.span
                              className={`ml-0.5 inline-block h-3 w-0.5 rounded-full align-middle ${
                                isAI ? "bg-info" : "bg-white"
                              }`}
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
            <div className="shrink-0 border-t border-app-border px-3 py-3">
              <div
                className={`flex items-end gap-2 rounded-xl border bg-app-surface-hover p-2 transition-colors ${
                  input ? "border-info/35" : "border-app-border"
                }`}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Escribí tu mensaje…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-40"
                  style={{ maxHeight: "80px", lineHeight: "1.5" }}
                />
                <motion.button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || loading}
                  whileHover={input.trim() && !loading ? { scale: 1.08 } : {}}
                  whileTap={{ scale: 0.92 }}
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-30 ${
                    input.trim() ? "bg-info text-white" : "bg-muted text-muted-foreground"
                  }`}
                  aria-label="Enviar mensaje"
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
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex size-14 items-center justify-center rounded-full bg-info shadow-xl"
        style={{ boxShadow: "0 8px 32px color-mix(in oklab, var(--info) 35%, transparent)" }}
        aria-label={open ? "Cerrar ARIA" : "Abrir ARIA"}
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
              <X size={20} className="text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles size={20} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

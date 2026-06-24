"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Loader2, CheckCircle2, RefreshCw, Power } from "lucide-react";

type State = "open" | "connecting" | "close" | "not_created" | "disabled";

interface StatusResp {
  instance?: string;
  state?: State;
  connected?: boolean;
  error?: string;
}
interface ConnectResp {
  instance?: string;
  qr_base64?: string | null;
  pairing_code?: string | null;
  state?: State;
  error?: string;
  detail?: string;
}

export function WhatsAppConnect() {
  const [state, setState] = useState<State | "loading">("loading");
  const [qr, setQr] = useState<string | null>(null);
  const [pairing, setPairing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/integraciones/whatsapp/status");
    const d = (await res.json()) as StatusResp;
    if (d.state) setState(d.state);
    return d.state;
  }, []);

  // Estado inicial
  useEffect(() => {
    refreshStatus().catch(() => setState("close"));
    return stopPolling;
  }, [refreshStatus, stopPolling]);

  // Cuando se conecta, dejamos de mostrar el QR.
  useEffect(() => {
    if (state === "open") {
      setQr(null);
      setPairing(null);
      stopPolling();
    }
  }, [state, stopPolling]);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/integraciones/whatsapp/connect", { method: "POST" });
      const d = (await res.json()) as ConnectResp;
      if (!res.ok) {
        setError(d.detail || d.error || "No se pudo iniciar la conexión.");
        return;
      }
      setQr(d.qr_base64 ?? null);
      setPairing(d.pairing_code ?? null);
      setState(d.state ?? "connecting");
      // Poll de estado hasta que el número quede vinculado.
      stopPolling();
      pollRef.current = setInterval(async () => {
        const s = await refreshStatus().catch(() => null);
        if (s === "open") stopPolling();
      }, 3000);
    } catch {
      setError("Error de red al conectar.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await fetch("/api/integraciones/whatsapp/disconnect", { method: "POST" });
      stopPolling();
      setQr(null);
      setState("close");
    } finally {
      setBusy(false);
    }
  }

  const connected = state === "open";

  return (
    <div
      className="max-w-xl rounded-2xl border p-6"
      style={{ backgroundColor: "#10101c", borderColor: "rgba(69,70,77,0.5)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <MessageCircle size={20} style={{ color: "#22c55e" }} />
        </div>
        <div className="flex-1">
          <p className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>
            WhatsApp
          </p>
          <StatusPill state={state} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
        Conectá tu número de WhatsApp para que el agente de atención al cliente
        responda y agende automáticamente. Escaneá el código con{" "}
        <span style={{ color: "#cbd5e1" }}>WhatsApp → Dispositivos vinculados → Vincular dispositivo</span>.
      </p>

      {state === "disabled" && (
        <p className="mt-4 rounded-lg p-3 text-sm" style={{ backgroundColor: "rgba(234,179,8,0.08)", color: "#eab308" }}>
          El servidor de WhatsApp (Evolution API) no está configurado todavía.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg p-3 text-sm" style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#f87171" }}>
          {error}
        </p>
      )}

      {/* QR */}
      {qr && !connected && (
        <div className="mt-5 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="QR de WhatsApp"
            width={232}
            height={232}
            className="rounded-xl bg-white p-2"
          />
          {pairing && (
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              o usá el código: <span className="font-mono" style={{ color: "#f1f5f9" }}>{pairing}</span>
            </p>
          )}
          <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
            <Loader2 size={13} className="animate-spin" /> Esperando a que escanees…
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-6 flex items-center gap-3">
        {!connected ? (
          <button
            type="button"
            onClick={connect}
            disabled={busy || state === "disabled" || state === "loading"}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
            style={{ backgroundColor: "#22c55e", color: "#04130a" }}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {qr ? "Regenerar QR" : "Conectar WhatsApp"}
          </button>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#22c55e" }}>
              <CheckCircle2 size={16} /> Conectado
            </span>
            <button
              type="button"
              onClick={disconnect}
              disabled={busy}
              className="ml-auto inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all disabled:opacity-40"
              style={{ borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              <Power size={14} /> Desvincular
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatusPill({ state }: { state: State | "loading" }) {
  const map: Record<string, { label: string; color: string }> = {
    open: { label: "Conectado", color: "#22c55e" },
    connecting: { label: "Esperando escaneo", color: "#eab308" },
    close: { label: "Desconectado", color: "#64748b" },
    not_created: { label: "Sin conectar", color: "#64748b" },
    disabled: { label: "No configurado", color: "#eab308" },
    loading: { label: "Cargando…", color: "#64748b" },
  };
  const s = map[state] ?? map.close;
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

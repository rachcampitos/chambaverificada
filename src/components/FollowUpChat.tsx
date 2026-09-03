"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Loader2, MessageCircleQuestion, Send } from "lucide-react";
import type { AnalysisResult, ChatMessage } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 800;
const MAX_MESSAGES = 12; // 6 exchanges — matches functions/api/chat.ts

interface FollowUpChatProps {
  offerText: string;
  result: AnalysisResult;
}

export function FollowUpChat({ offerText, result }: FollowUpChatProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const atLimit = messages.length >= MAX_MESSAGES;

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading || atLimit) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerText, result, messages: nextMessages }),
      });

      if (res.status === 429) {
        setError("Demasiados mensajes seguidos. Espera unos minutos.");
        return;
      }
      if (!res.ok) throw new Error(`chat failed: ${res.status}`);

      const data: { reply: string } = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setError("No logré responder eso. ¿Lo intentamos de nuevo?");
    } finally {
      setIsLoading(false);
    }
  }

  if (!expanded) {
    return (
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1.5 rounded text-[12.5px] font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden="true" />
          ¿Tienes dudas sobre este resultado? Pregúntale
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 flex max-h-[420px] flex-col overflow-hidden rounded-[18px] border border-card-border bg-card"
    >
      <div className="border-b border-card-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        Pregunta sobre este resultado
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <ChatBubble role="assistant">
          Puedo ayudarte a entender por qué el riesgo quedó en{" "}
          <strong>{result.risk === "low" ? "bajo" : result.risk === "medium" ? "medio" : "alto"}</strong>, o
          sugerirte qué preguntarle a la empresa antes de postular. Pregúntame lo que quieras.
        </ChatBubble>

        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role}>
            {m.content}
          </ChatBubble>
        ))}

        {isLoading && (
          <div className="flex items-center gap-1.5 text-[12px] text-foreground-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Escribiendo...
          </div>
        )}
      </div>

      <div aria-live="polite" className="px-4">
        {error && <p className="mb-2 text-[12px] text-risk-high-text">{error}</p>}
        {atLimit && (
          <p className="mb-2 text-[12px] text-foreground-muted">
            Llegaste al límite de esta conversación. Verifica otra oferta para empezar de nuevo.
          </p>
        )}
      </div>

      {/* Plain div, not <form> — this whole component already renders inside
          page.tsx's <form id="offer-form">, and HTML doesn't allow nested
          forms. A nested <form> here parses as invalid and the browser's
          fallback behavior on submit was a real, silent full-page navigation
          that wiped all state — Enter/submit is handled manually instead. */}
      <div className="flex items-center gap-2 border-t border-card-border p-3">
        <label htmlFor="chat-input" className="sr-only">
          Tu pregunta
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={isLoading || atLimit}
          placeholder="Escribe tu pregunta..."
          className="flex-1 rounded-lg border border-card-border bg-transparent px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-foreground-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading || atLimit}
          aria-label="Enviar pregunta"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-btn text-white transition-colors hover:bg-btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

function ChatBubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
          isUser ? "bg-btn text-white" : "bg-primary-tint text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

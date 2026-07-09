import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Send, Sparkles, Loader2, MessageSquare, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  fetchBlueprint, fetchChatHistory, sendChatMessage,
  fetchSuggestedPrompts, humanizeError,
} from "../lib/api";

function Bubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        data-testid={`chat-bubble-${role}`}
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-neutral-950 text-white"
            : "border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-sm"
        }`}
      >
        {content.split("\n").map((line, i) => (
          <div key={i}>{line || <>&nbsp;</>}</div>
        ))}
      </div>
    </div>
  );
}

export default function Copilot() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [rec, hist, sugg] = await Promise.all([
          fetchBlueprint(id),
          fetchChatHistory(id).catch(() => []),
          fetchSuggestedPrompts().catch(() => []),
        ]);
        setRecord(rec);
        setMessages(hist);
        setSuggestions(sugg);
      } catch (e) {
        toast.error(`Failed to load Copilot: ${humanizeError(e)}`);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    const optimistic = [...messages, { role: "user", content }];
    setMessages(optimistic);
    try {
      const res = await sendChatMessage(id, content);
      setMessages([...optimistic, { role: "assistant", content: res.reply }]);
      if (res.suggested_prompts?.length) setSuggestions(res.suggested_prompts);
    } catch (e) {
      toast.error(humanizeError(e), { duration: 10000 });
      setMessages(optimistic); // keep user's message visible
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!record) {
    return (
      <main data-testid="copilot-loading" className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-24 lg:px-10">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
        <span className="text-neutral-400">Loading Copilot…</span>
      </main>
    );
  }

  return (
    <main data-testid="copilot-page" className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-16">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/results/${id}`}
          data-testid="back-to-results"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to blueprint
        </Link>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Copilot has full context of your <b className="text-neutral-100">&nbsp;{record.startup_name}&nbsp;</b> blueprint.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Chat */}
        <section className="lg:col-span-8">
          <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <header className="border-b border-neutral-800 bg-neutral-950/70 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-950 text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold text-neutral-50">Vidur Copilot</div>
                  <div className="text-xs text-neutral-500">Business Analyst · Powered by IBM watsonx.ai</div>
                </div>
              </div>
            </header>

            <div ref={scrollRef} data-testid="chat-scroll" className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
              {messages.length === 0 && (
                <div className="mx-auto max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center shadow-sm">
                  <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="font-display text-lg font-semibold text-neutral-50">Ask me anything about your startup</div>
                  <p className="mt-1 text-sm text-neutral-500">
                    I have your full blueprint in context. Try a suggestion on the right, or type a question below.
                  </p>
                </div>
              )}
              {messages.map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}
              {sending && (
                <div data-testid="chat-thinking" className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Copilot is thinking…
                </div>
              )}
            </div>

            <div className="border-t border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  data-testid="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  rows={2}
                  placeholder="Ask about viability, competitors, pricing, GTM, MVP scope…"
                  className="min-h-[52px] resize-none border-neutral-800"
                  disabled={sending}
                />
                <Button
                  data-testid="chat-send"
                  onClick={() => send()}
                  disabled={sending || !input.trim()}
                  className="h-[52px] rounded-lg bg-neutral-950 px-4 text-white hover:brightness-110 disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar: context + suggestions */}
        <aside className="lg:col-span-4">
          <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-sm">
            <div className="eyebrow">Startup context</div>
            <div className="mt-2 font-display text-xl font-bold text-neutral-50">{record.startup_name}</div>
            <div className="mt-1 text-xs text-neutral-500">{record.industry} · {record.target_audience}</div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400 line-clamp-4">{record.startup_idea}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-sm">
            <div className="eyebrow">Try one of these</div>
            <ul className="mt-3 space-y-2">
              {suggestions.map((p, i) => (
                <li key={i}>
                  <button
                    data-testid={`suggestion-${i}`}
                    onClick={() => send(p)}
                    disabled={sending}
                    className="card-hover w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-950 hover:text-neutral-50"
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

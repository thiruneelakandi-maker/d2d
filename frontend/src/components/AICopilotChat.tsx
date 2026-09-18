import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { aiAPI } from '../services/api';

interface AICopilotChatProps {
  emergencyContext?: any;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AICopilotChat: React.FC<AICopilotChatProps> = ({ emergencyContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "I am your AI Emergency Copilot. You can ask follow-up questions about first aid, safety steps, or what to do while dispatch is on the way. (e.g., 'How do I stop severe bleeding?', 'Can I move the patient?').",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(newMessages, emergencyContext);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I could not reach the server. Keep the patient calm, ensure scene safety, and stay on the line with 911 / 112 dispatchers.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How do I control severe bleeding?",
    "Should I move the victim?",
    "What if the patient stops breathing?",
    "How to treat a burn?"
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[480px] overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              Emergency Copilot
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-2.5 h-2.5" /> AI Live
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instant answers grounded in verified emergency protocols
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs rounded-tr-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-transparent dark:border-slate-700/60'
              }`}
            >
              {msg.content}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Consulting emergency protocols...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Quick:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setInput(prompt);
            }}
            className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this situation..."
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

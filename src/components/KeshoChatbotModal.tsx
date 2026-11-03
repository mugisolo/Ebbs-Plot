import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Brain, Bot, User, RefreshCw, Flame } from 'lucide-react';
import { ChatMessage } from '../types';

interface KeshoChatbotModalProps {
  onClose: () => void;
}

export const KeshoChatbotModal: React.FC<KeshoChatbotModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Oli otya! 👋 I am your **Kesho Entebbe Concierge**—your AI guide to everything happening across the Entebbe Peninsula. Looking for Lake Victoria jazz sundowners at Waterfront, high-stakes trivia nights in Kitoro, Amapiano beach raves at Aero Beach, or Nakiwogo sunset boat cruises? Tell me your vibe or budget!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const QUICK_PROMPTS = [
    'Where is the best lakeside Afro-Jazz in Entebbe?',
    'Fun pub quiz nights in Kitoro this week',
    'Events under UGX 30,000 in Entebbe',
    'Plan a Saturday beach & boat cruise itinerary in Entebbe',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          useHighThinking,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch AI response');

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an issue connecting to the AI brain (${err.message}). Make sure your Gemini API key is configured.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl h-[88vh] max-h-[760px] rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative text-left">
        {/* Header */}
        <div className="p-4 bg-[#1f1f2e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF2D55] via-[#FF5E3A] to-[#FFCC00] flex items-center justify-center shadow-lg shadow-[#FF2D55]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Kesho Concierge</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  AI Online
                </span>
              </div>
              <p className="text-xs text-white/50">Entebbe Lakeshore Nightlife, Beaches &amp; Event Planner</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Thinking Mode Switch (gemini-4-argon with ThinkingLevel.HIGH) */}
            <button
              onClick={() => setUseHighThinking(!useHighThinking)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                useHighThinking
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
              }`}
              title="Toggle High Thinking Mode (gemini-4-argon)"
            >
              <Brain className={`w-3.5 h-3.5 ${useHighThinking ? 'text-[#FFCC00]' : ''}`} />
              <span className="hidden sm:inline">
                {useHighThinking ? 'High Thinking (gemini-4-argon)' : 'Flash Mode'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-[#FF2D55] text-white'
                      : 'bg-[#1f1f2e] border border-white/10 text-[#FFCC00]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#FF2D55] text-white rounded-tr-none'
                      : 'bg-[#1f1f2e] border border-white/10 text-white/90 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.content}
                  <div
                    className={`mt-1.5 flex items-center gap-2 text-[10px] ${
                      isUser ? 'text-white/60 justify-end' : 'text-white/40 justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-black/30">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1f1f2e] border border-white/10 text-[#FFCC00] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#1f1f2e] border border-white/10 flex items-center gap-2 text-xs text-white/70">
                <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-ping" />
                <span>
                  {useHighThinking
                    ? 'Reasoning deeply on Entebbe events with gemini-4-argon...'
                    : 'Curating Entebbe spots with Gemini...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#16161f] overflow-x-auto no-scrollbar flex items-center gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-[#1f1f2e] hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/5 transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 bg-[#16161f] border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Entebbe nightlife, beach raves, boat cruises, or local services..."
              className="flex-1 px-4 py-3 rounded-2xl bg-[#0d0d12] border border-white/10 text-white placeholder:text-white/40 text-xs md:text-sm focus:outline-none focus:border-[#FF2D55]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shadow-lg shadow-[#FF2D55]/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

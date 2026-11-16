import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { askVayuCopilot, type TelemetryContext } from '../../services/geminiService';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface VayuAICopilotProps {
  telemetryContext?: TelemetryContext;
}

const SUGGESTED_QUESTIONS = [
  '🏃 Is it safe to jog in Cubbon Park today?',
  '😷 Mask advice for Silk Board & ORR commute',
  '🍃 Why is PM2.5 elevated this morning?',
  '👶 Precautions for school children right now',
];

export const VayuAICopilot: React.FC<VayuAICopilotProps> = ({ telemetryContext }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am **Vayu-AI**, your Gemini-powered atmospheric and health intelligence assistant. 

I'm continuously analyzing real-time Bengaluru air telemetry (AQI, particulate concentrations, and meteorological trends). How can I assist your health or commute decisions today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askVayuCopilot(q, telemetryContext);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach Gemini AI.';
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ **Unable to complete analysis**: ${msg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Render text with basic markdown formatting (*bold*, lists)
  const renderFormattedText = (rawText: string) => {
    return rawText.split('\n').map((line, idx) => {
      // Bullet list item
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemContent = line.trim().replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatBold(itemContent) }} />
          </li>
        );
      }

      // Numbered list item
      if (/^\d+\.\s+/.test(line.trim())) {
        return (
          <div key={idx} className="my-1 font-semibold text-forest">
            <span dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-1" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
      );
    });
  };

  const formatBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest text-ivory shadow-2xl hover:bg-[#071b15] transition-all transform hover:scale-105 border border-[#1b4336]"
          title="Ask Vayu-AI Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-serif text-sm font-semibold tracking-wide flex items-center gap-1.5">
            Ask Vayu-AI
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          </span>
        </button>
      )}

      {/* Copilot Dialog Window */}
      {isOpen && (
        <div 
          className={`flex flex-col bg-white rounded-2xl shadow-2xl border border-sage/30 overflow-hidden transition-all duration-200 ${
            isMinimized 
              ? 'w-80 h-14' 
              : 'w-[90vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
          style={{ boxShadow: '0 20px 40px -15px rgba(4, 16, 12, 0.25)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-forest text-ivory flex items-center justify-between border-b border-[#14332A] select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#14332A] border border-[#235747]">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm tracking-tight">Vayu-AI Copilot</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    Gemini
                  </span>
                </div>
                {!isMinimized && (
                  <div className="text-[11px] text-sage-light flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    Live Bengaluru Atmospheric Context
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-sage-light hover:text-ivory rounded hover:bg-[#14332A] transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-sage-light hover:text-ivory rounded hover:bg-[#14332A] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Telemetry pill preview */}
              {telemetryContext && (
                <div className="px-3.5 py-1.5 bg-ivory-subtle border-b border-sage/20 flex items-center justify-between text-[11px] text-charcoal-muted">
                  <span>
                    Current Context: <strong className="text-forest font-semibold">AQI {telemetryContext.aqi ?? '—'}</strong> ({telemetryContext.category || 'Live'})
                  </span>
                  <span>PM2.5: {telemetryContext.pm25 ? `${telemetryContext.pm25} µg/m³` : '—'}</span>
                </div>
              )}

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#FAFDFB]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                        msg.sender === 'user'
                          ? 'bg-sage text-ivory'
                          : 'bg-forest text-emerald-400'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-forest text-ivory rounded-tr-none'
                          : 'bg-white border border-sage/20 text-charcoal rounded-tl-none shadow-editorial'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          msg.sender === 'user' ? 'text-sage-light/80' : 'text-charcoal-muted'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-charcoal-muted pl-8 py-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest" />
                    <span>Gemini is synthesizing atmospheric telemetry...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 bg-white border-t border-sage/15">
                  <div className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider mb-1.5">
                    Quick Inquiries:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        disabled={loading}
                        className="text-[11px] text-left px-2.5 py-1 rounded-full bg-ivory-subtle border border-sage/25 hover:border-forest/50 hover:bg-sage-soft/60 text-charcoal transition-colors truncate max-w-full"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <div className="p-3 bg-white border-t border-sage/20 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Bengaluru air, commute, or health..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-sage/30 bg-ivory-light focus:outline-none focus:ring-1 focus:ring-forest text-charcoal placeholder:text-charcoal-muted"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-forest text-ivory hover:bg-[#071b15] disabled:opacity-40 transition-colors flex items-center justify-center"
                  title="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

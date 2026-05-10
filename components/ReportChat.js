'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ReportChat({ report, isOpen, onClose, initialContext }) {
  const [messages, setMessages] = useState(() => {
    if (initialContext) {
      return [{ 
        role: 'user', 
        content: `I'm interested in this finding from the report: "${initialContext}". Can you explain it more?` 
      }];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = useCallback(async (content = input) => {
    if (!content.trim() || loading) return;

    // Check if we are adding a NEW message or just processing the initial one
    const isNew = content.trim() !== (messages[messages.length-1]?.content);
    
    if (isNew) {
      const userMsg = { role: 'user', content: content.trim() };
      setMessages(prev => [...prev, userMsg]);
    }
    
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          report, 
          messages: isNew ? [...messages, { role: 'user', content: content.trim() }] : messages
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      
      const aiMsg = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, aiMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiContent += decoder.decode(value);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = aiContent;
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, report]);

  // Trigger the first response if there's an initial message
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'user' && !loading && isOpen) {
      const timer = setTimeout(() => {
        handleSend(messages[0].content);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, loading, handleSend]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-black/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl animate-slide-in-right">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-1/20 text-accent-1">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold">Analysis Q&A</h3>
          </div>
          <button onClick={onClose}
            className="p-0.5 rounded-full overflow-hidden group"
            style={{ background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}
          >
            <div className="p-1.5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
              <X size={16} className="text-white group-hover:rotate-90 transition-all duration-500" />
            </div>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Bot size={48} className="mb-4" />
              <p className="text-sm">Ask me anything about your report.<br/>How can I help you improve your code?</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-lg h-fit ${m.role === 'user' ? 'bg-accent-1/20' : 'bg-white/10'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-accent-1 text-white' : 'glass-panel'}`}>
                <ReactMarkdown className="markdown-body text-xs leading-relaxed">
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="p-2 rounded-lg h-fit bg-white/10">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="glass-panel p-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/5">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a follow-up question..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-12 outline-none focus:border-accent-1 transition-all resize-none text-sm h-20"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-3 bottom-3 overflow-hidden group/btn disabled:opacity-40 disabled:pointer-events-none"
              style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '12px', boxShadow: '0 0 18px rgba(99,102,241,0.4)', display: 'inline-flex' }}
            >
              <div className="p-2.5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: '11px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                <Send size={16} className="text-indigo-200 group-hover/btn:text-white group-hover/btn:-rotate-12 transition-all duration-300" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BrainCircuit, Send } from 'lucide-react';
import { PageHeader, Card, PulseLoader } from '../design-system/components';
import { pageVariants, pageTransition, slideUp } from '../design-system/animations';
import { API_BASE } from '../utils/api';

const FarmAssistant = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Set initial message using translations
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        sender: 'ai',
        text: t('assistant_greeting')
      }]);
    } else if (messages.length === 1 && messages[0].sender === 'ai') {
      // Update initial greeting when language changes
      setMessages([{
        id: 1,
        sender: 'ai',
        text: t('assistant_greeting')
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/farm-assistant`, {
        question: userMsg.text
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer || "I'm sorry, I couldn't process that request."
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'error',
        text: err.response?.data?.error || "AI assistant is currently unavailable. Please try again later."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      {...pageVariants}
      transition={pageTransition}
      className="flex-1 flex flex-col h-[calc(100vh-8rem)] space-y-6 pb-6"
    >
      <PageHeader
        icon={BrainCircuit}
        title={t('assistant_title')}
        subtitle="Gemini Advisory Console Terminal"
        className="mb-0 flex-shrink-0"
      />

      <Card
        variant="glass"
        padding="none"
        className="flex-1 flex flex-col relative overflow-hidden group shadow-lg border border-white/[0.04]"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Chat History View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                {...slideUp}
                className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border font-mono font-bold text-caption ${
                  msg.sender === 'user'
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                    : msg.sender === 'error'
                      ? 'bg-danger/10 border-danger/20 text-danger-light'
                      : 'bg-white/[0.02] border-white/[0.04] text-white/40'
                }`}>
                  {msg.sender === 'user' ? 'USR' : 'AI'}
                </div>
                
                <div className={`max-w-[75%] rounded-lg p-4 font-mono text-body-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-500/[0.04] border border-brand-500/10 text-white/90 rounded-tr-none'
                    : msg.sender === 'error'
                      ? 'bg-danger/5 border border-danger/10 text-danger-light rounded-tl-none'
                      : 'bg-white/[0.01] border border-white/[0.03] text-white/70 rounded-tl-none'
                }`}>
                  {msg.sender === 'error' ? (
                    <p className="font-semibold">{msg.text}</p>
                  ) : (
                    <div
                      className="markdown-content font-light"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-400 font-semibold">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="text-brand-300 italic">$1</em>')
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div {...slideUp} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-white/[0.02] border-white/[0.04] text-white/40 animate-pulse">
                AI
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4 rounded-tl-none flex items-center gap-3.5 w-fit font-mono text-caption text-white/30">
                <PulseLoader />
                <span>compiling intelligence advisor response</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Console Command Input area */}
        <div className="p-4 bg-surface-900/60 border-t border-white/[0.04] relative z-10 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <span className="absolute left-4 text-white/20 font-mono text-body-sm select-none">&gt;</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask terminal AI crop advisory questions..."
              disabled={loading}
              className="w-full bg-black/20 border border-white/[0.04] rounded-lg py-3 pl-8 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/30 focus:ring-1 focus:ring-brand-500/10 transition-all font-mono text-body-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="absolute right-2 p-2 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-brand-500/20 hover:text-white active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-[8px] text-white/20 uppercase tracking-widest mt-3 font-mono">
            {t('assistant_warning')}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default FarmAssistant;

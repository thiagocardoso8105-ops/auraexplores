
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, X } from 'lucide-react';
import { ChatMessage, FileItem, Language } from '../types';
import { getSmartInsights } from '../services/geminiService';
import { translations } from '../translations';

interface AIChatProps {
  files: FileItem[];
  lang: Language;
  onClose: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ files, lang, onClose }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: t.aiGreeting, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getSmartInsights(input, files, lang);
    
    const assistantMsg: ChatMessage = { role: 'assistant', text: response, timestamp: new Date() };
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100">{t.aiAssistant}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/20' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-600'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-3 flex items-center space-x-2 border border-slate-200 dark:border-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500 dark:text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.aiThinking}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.aiPlaceholder}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

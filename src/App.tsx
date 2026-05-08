import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Info, 
  MessageSquare, 
  BookOpen, 
  Quote, 
  X, 
  ChevronRight, 
  Plus, 
  Trash2,
  Menu,
  Clock
} from 'lucide-react';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { getHaiderChatStream } from './services/geminiService';
import { cn } from './lib/utils';
import { HIKMAH_QUOTES, LOGO_URL } from './constants';
import { Message, ChatSession } from './types';

const STORAGE_KEY = 'haider_ai_sessions';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sessions', e);
        return [];
      }
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;
  const messages = currentSession?.messages || [];

  // Persistence
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Contemplation',
      messages: [
        {
          id: 'welcome-' + Date.now(),
          role: 'model',
          content: "As-salamu alaykum. I am **Haider AI**. I stand as a digital companion guided by the pursuit of logic, the depth of philosophy, and the principles of universal justice. \n\nHow may I assist you in your contemplation today?",
          timestamp: Date.now()
        }
      ],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Initialize first chat if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      startNewChat();
    } else if (!currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const handleSend = async (content: string) => {
    if (!currentSessionId) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content,
      timestamp: Date.now()
    };
    
    const initialAIMessage: Message = { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      content: '',
      timestamp: Date.now() + 1
    };

    // Update session with user message
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const title = s.messages.length <= 1 ? (content.length > 30 ? content.slice(0, 30) + '...' : content) : s.title;
        return {
          ...s,
          title,
          updatedAt: Date.now(),
          messages: [...s.messages, userMessage, initialAIMessage]
        };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      let fullResponse = '';
      const stream = getHaiderChatStream(history);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            const lastMessages = [...s.messages];
            const lastIdx = lastMessages.length - 1;
            if (lastMessages[lastIdx].role === 'model') {
              lastMessages[lastIdx] = { ...lastMessages[lastIdx], content: fullResponse };
            }
            return { ...s, messages: lastMessages };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error(error);
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const lastMessages = [...s.messages];
          lastMessages[lastMessages.length - 1].content = "Forgive me, but a momentary disruption has occurred. Even the most refined tools may falter. Shall we try our inquiry again?";
          return { ...s, messages: lastMessages };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-charcoal-950 font-sans selection:bg-gold-500/30 selection:text-gold-200 overflow-hidden">
      
      {/* Left Sidebar - Chat History */}
      <AnimatePresence>
        {isLeftSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/5 bg-charcoal-900 shadow-2xl lg:relative"
          >
            <div className="p-6 flex flex-col h-full">
              <button 
                onClick={startNewChat}
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 px-4 text-xs font-bold text-charcoal-950 transition-all hover:bg-gold-400 shadow-lg shadow-gold-500/10 mb-8"
              >
                <Plus className="h-4 w-4" />
                NEW CONTEMPLATION
              </button>

              <div className="flex items-center gap-2 px-2 mb-4">
                <Clock className="h-3.5 w-3.5 text-gold-500/50" />
                <h2 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Recent Inquiries</h2>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSessionId(s.id)}
                    className={cn(
                      "group relative w-full text-left rounded-xl p-3 transition-all",
                      currentSessionId === s.id 
                        ? "bg-white/5 border border-white/10" 
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          currentSessionId === s.id ? "text-gold-500" : "text-neutral-500 group-hover:text-gold-500/50"
                        )} />
                        <span className={cn(
                          "truncate text-xs font-medium",
                          currentSessionId === s.id ? "text-neutral-100" : "text-neutral-500 group-hover:text-neutral-300"
                        )}>
                          {s.title}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => deleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 items-center justify-between flex">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-charcoal-800 border border-gold-500/20 flex items-center justify-center">
                    <img src={LOGO_URL} className="h-5 w-5" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider">HAIDER AI 1.0</span>
                </div>
                <button onClick={() => setIsLeftSidebarOpen(false)} className="lg:hidden p-2 text-neutral-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-charcoal-900/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                className="p-2 -ml-2 text-neutral-500 hover:text-white transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold-600 to-gold-400 rounded-2xl blur opacity-25" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-charcoal-800 border border-gold-500/30 text-gold-500 overflow-hidden">
                    <img 
                      src={LOGO_URL} 
                      alt="Logo" 
                      className="h-full w-full object-contain p-1"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <ShieldCheck className="h-6 w-6 hidden" />
                  </div>
                </div>
                <div>
                  <h1 className="font-serif text-xl font-bold text-white">
                    {currentSession?.title || 'Haider AI'}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden items-center gap-8 md:flex">
                <button 
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  className={cn(
                    "flex items-center gap-2 text-xs font-bold transition-all uppercase tracking-widest",
                    isLeftSidebarOpen ? "text-gold-500" : "text-neutral-400 hover:text-gold-500"
                  )}
                >
                  <Clock className="h-4 w-4" />
                  History
                </button>
                <button 
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className={cn(
                    "flex items-center gap-2 text-xs font-bold transition-all uppercase tracking-widest",
                    isRightSidebarOpen ? "text-gold-500" : "text-neutral-400 hover:text-gold-500"
                  )}
                >
                  <Quote className="h-4 w-4" />
                  Hikmah
                </button>
              </nav>
              <div className="h-8 w-px bg-white/10" />
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:border-gold-500/50 hover:text-gold-500 transition-all">
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto pt-8 scrollbar-hide">
          <div className="mx-auto max-w-4xl px-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, idx) => (
                <ChatBubble 
                  key={message.id} 
                  message={message} 
                  isLatest={idx === messages.length - 1 && message.role === 'model'}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-32" />
          </div>

          {/* Floating Background Elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-48 h-[600px] w-[600px] rounded-full bg-gold-900/5 blur-[120px]" />
            <div className="absolute bottom-0 -right-48 h-[600px] w-[600px] rounded-full bg-gold-500/5 blur-[120px]" />
          </div>
        </main>

        {/* Input Area */}
        <footer className="z-10">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </footer>
      </div>

      {/* Right Sidebar - Hikmah */}
      <AnimatePresence>
        {isRightSidebarOpen && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="hidden lg:flex w-80 flex-col border-l border-white/5 bg-charcoal-900/50 backdrop-blur-xl shrink-0"
          >
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote className="h-4 w-4 text-gold-500" />
                <h2 className="text-xs font-bold tracking-[0.2em] text-white uppercase">Curated Hikmah</h2>
              </div>
              <button onClick={() => setIsRightSidebarOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
              {HIKMAH_QUOTES.map((quote, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-gold-500/50 via-gold-500/10 to-transparent" />
                    <p className="font-serif italic text-sm leading-relaxed text-neutral-300 group-hover:text-gold-200 transition-colors">
                      "{quote.text}"
                    </p>
                    <cite className="mt-3 block text-[10px] font-bold tracking-widest text-gold-500/50 uppercase not-italic">
                      — {quote.source}
                    </cite>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

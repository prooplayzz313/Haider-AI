import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { LOGO_URL } from '@/src/constants';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface ChatBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export const ChatBubble = ({ message, isLatest }: ChatBubbleProps) => {
  const isAI = message.role === 'model';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-5 py-6",
        !isAI && "flex-row-reverse"
      )}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-xl border overflow-hidden shadow-lg",
        isAI 
          ? "bg-charcoal-800 border-gold-500/30 text-gold-500" 
          : "bg-gold-500 border-gold-400 text-charcoal-950"
      )}>
        {isAI ? (
          <div className="relative h-full w-full flex items-center justify-center p-0.5">
            <img 
              src={LOGO_URL} 
              alt="Logo" 
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <ShieldCheck className="h-6 w-6 hidden" />
          </div>
        ) : (
          <User className="h-6 w-6" />
        )}
      </div>

      <div className={cn(
        "flex max-w-[85%] flex-col gap-2",
        !isAI && "items-end text-right"
      )}>
        <div className={cn(
          "text-[10px] font-bold tracking-[0.2em] uppercase",
          isAI ? "text-gold-500/70" : "text-neutral-500"
        )}>
          {isAI ? 'Haider AI' : 'Truth Seeker'}
        </div>
        
        <div className={cn(
          "relative rounded-2xl px-6 py-4 text-[15px] leading-relaxed shadow-2xl transition-all duration-300",
          isAI 
            ? "bg-charcoal-900/50 border border-white/5 text-neutral-200 font-serif" 
            : "bg-gold-500/10 border border-gold-500/20 text-gold-50 font-medium"
        )}>
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          {isAI && isLatest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -right-14 top-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/10 text-gold-500 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

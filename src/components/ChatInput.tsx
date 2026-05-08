import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 pb-12">
      <form
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        className="relative flex items-end gap-3 rounded-2xl bg-charcoal-900 border border-white/10 p-3 shadow-2xl ring-1 ring-white/5 focus-within:ring-gold-500/30 transition-all duration-300"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gold-500/50">
          <Hash className="h-5 w-5" />
        </div>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Seek wisdom or inquire about justice..."
          rows={1}
          className="max-h-60 w-full resize-none bg-transparent py-3 text-[15px] text-neutral-100 outline-none placeholder:text-neutral-500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
            input.trim() && !isLoading
              ? "bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20 hover:bg-gold-400"
              : "bg-white/5 text-neutral-600"
          )}
        >
          <motion.div
            animate={isLoading ? { rotate: 360 } : {}}
            transition={isLoading ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          >
            <Send className="h-5 w-5" />
          </motion.div>
        </button>
      </form>
      
      <div className="mt-4 flex items-center justify-center gap-6">
        <p className="text-[10px] text-neutral-600 font-bold tracking-[0.3em] uppercase">
          Haider AI • Guided by Wisdom & Adab
        </p>
      </div>
    </div>
  );
};

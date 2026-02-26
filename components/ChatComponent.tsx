"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { User, Stethoscope } from "lucide-react";

interface ChatComponentProps {
  conversation: Message[];
  partialUserText?: string;
  aiSpeaking?: boolean;
}

export default function ChatComponent({
  conversation,
  partialUserText,
  aiSpeaking,
}: ChatComponentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation, partialUserText]);

  return (
    <div
      ref={scrollRef}
      className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-4 h-80 overflow-y-auto space-y-4 border border-white/10 shadow-inner scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
    >
      <AnimatePresence initial={false}>
        {conversation.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            } items-end gap-2`}
          >
            {m.role !== "user" && (
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30 flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-teal-400" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-neutral-800 text-neutral-100 rounded-bl-sm border border-white/5"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 font-semibold">
                {m.role === "user" ? "You" : "AI Doctor"}
                {m.role !== "user" && aiSpeaking && i === conversation.length - 1 && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] text-green-400">Speaking...</span>
                  </span>
                )}
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{m.text}</div>
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {partialUserText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end items-end gap-2"
        >
          <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-blue-600/50 backdrop-blur-sm text-white rounded-br-sm border border-blue-400/30">
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 font-semibold flex items-center gap-1">
              You <span className="animate-pulse">●</span>
            </div>
            <div className="text-sm leading-relaxed font-sans">{partialUserText}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0 opacity-50">
            <User className="w-4 h-4 text-blue-400" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

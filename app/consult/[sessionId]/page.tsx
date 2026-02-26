"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VoiceCall from "@/components/VoiceCall";
import { Message } from "@/types";

type SessionData = {
  sessionId: string;
  notes: string;
  selectedDoctor: {
    image: string;
    specialist: string;
    description: string;
  };
};

export default function ConsultSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [callStarted, setCallStarted] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [initialConversation, setInitialConversation] = useState<Message[]>([]);

  useEffect(() => {
    let interval: any;
    if (callStarted) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStarted]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const [resSession, resConversation] = await Promise.all([
          fetch(`/api/session/${sessionId}`),
          fetch(`/api/conversation/${sessionId}`),
        ]);
        if (!resSession.ok) {
          setLoading(false);
          return;
        }
        const data = await resSession.json();
        const conv = resConversation.ok ? await resConversation.json() : [];
        setSessionData(data);
        setInitialConversation(conv || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading session...</div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Session not found</div>
      </div>
    );
  }

  const { selectedDoctor } = sessionData;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
      <VoiceCall
        sessionId={sessionData.sessionId}
        systemPrompt="You are a multilingual AI medical doctor. Always respond in the same language the user speaks. If the user switches language, switch automatically. Keep responses short and conversational."
        doctor={selectedDoctor}
        initialConversation={initialConversation}
      />
    </div>
  );
}

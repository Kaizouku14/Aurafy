"use client";

import { useState } from "react";
import {
  AudioLines,
  Brain,
  Sparkles,
  CalendarCheck2,
  FileText,
  Chrome,
} from "lucide-react";
import { authClient } from "@/server/better-auth/client";
import { PAGE_ROUTES } from "@/constants/page-routes";
import FeatureCard from "./card/feature-card";
import { LoginButton } from "./login-button";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: PAGE_ROUTES.HOME,
        errorCallbackURL: PAGE_ROUTES.LOGIN,
      });
    } catch (error) {
      console.error("Auth error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="bg-main border-border relative flex flex-col justify-between overflow-hidden border-b-[3px] p-6 sm:p-8 lg:border-r-[3px] lg:border-b-0 lg:p-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[40px_40px] opacity-[0.03]" />

        <div className="relative z-10">
          <div className="bg-background border-border shadow-shadow flex w-fit -rotate-1 items-center gap-2 border-[3px] px-4 py-2">
            <AudioLines className="size-5" />
            <span className="text-lg font-black tracking-tighter uppercase">
              Aurafy
            </span>
          </div>

          <div className="mt-10 max-w-2xl sm:mt-20">
            <h1 className="text-main-foreground text-3xl leading-[0.85] font-black tracking-tighter sm:text-5xl md:text-7xl">
              STUDY DEEPER. <br />
              <span className="text-background drop-shadow-[2px_2px_0_#000]">
                FEEL BETTER.
              </span>
            </h1>
            <p className="text-main-foreground/80 mt-4 max-w-md text-base leading-tight font-medium text-balance sm:mt-6 sm:text-lg">
              AI-driven mood detection meets Spotify. Build focus with Pomodoro
              cycles and SM-2 spaced repetition.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:mt-0">
          <FeatureCard
            icon={<Sparkles className="size-4" />}
            title="Llama-4 Discovery"
            desc="Blends your top artists with real-time mood mapping."
            rotation="rotate-1"
          />
          <FeatureCard
            icon={<Brain className="size-4" />}
            title="SM-2 Flashcards"
            desc="Adaptive review cycles for exam deadlines."
            rotation="rotate-[-1deg]"
          />
          <FeatureCard
            icon={<CalendarCheck2 className="size-4" />}
            title="AI Study Planner"
            desc="Auto-generate study schedules based on your exams."
            rotation="rotate-[-0.5deg]"
          />
          <FeatureCard
            icon={<FileText className="size-4" />}
            title="Cornell Notes"
            desc="Structured note-taking with cues, notes, and summaries."
            rotation="rotate-[0.5deg]"
          />
        </div>

        <div className="relative z-10 hidden pt-8 lg:block">
          <p className="text-main-foreground/40 text-[10px] font-bold tracking-[0.15em] uppercase">
            System: qwen/qwen3.6-27b // openai/gpt-oss-120b/20b
          </p>
        </div>
      </section>

      <main className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-95">
          <header className="mb-10">
            <h2 className="text-4xl font-black tracking-tighter">
              Get Started
            </h2>
            <div className="bg-main mt-2 h-1.5 w-12" />
            <p className="text-muted-foreground mt-4 font-medium text-balance">
              Join students using Aurafy to sync their sound with their study
              flow.
            </p>
          </header>

          <div className="space-y-4">
            <LoginButton
              provider="google"
              label="Google"
              icon={Chrome}
              isLoading={isLoading}
              onClick={handleGoogleLogin}
            />
            <div className="bg-secondary/30 border-border border-2 p-4 text-[13px] leading-snug">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Spotify Note:</strong> Sign
                in with Google first, then connect Spotify from inside the app
                if you want Premium playback.
              </p>
              <p className="text-muted-foreground mt-2">
                Full Spotify playback controls require Premium. Free accounts
                may be limited to available previews.
              </p>
              <p className="text-muted-foreground mt-2">
                If Spotify isn&apos;t available, you can still listen with
                YouTube Music.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

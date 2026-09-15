"use client";

import { useState } from "react";
import { MotionConfig } from "framer-motion";
import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/hero";
import { SkillMarquee } from "@/components/portfolio/marquee";
import { About } from "@/components/portfolio/about";
import { Expertise } from "@/components/portfolio/expertise";
import { Experience } from "@/components/portfolio/experience";
import { Projects } from "@/components/portfolio/projects";
import { Products } from "@/components/portfolio/products";
import { Highlights } from "@/components/portfolio/highlights";
import { AiExperience } from "@/components/portfolio/ai-experience";
import { Toolkit } from "@/components/portfolio/toolkit";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";
import { ChatWidget } from "@/components/portfolio/chat-widget";
import { BackToTop } from "@/components/portfolio/back-to-top";
import { PrintResume } from "@/components/portfolio/print-resume";
import { CommandPalette } from "@/components/portfolio/command-palette";

function Divider() {
  return (
    <div aria-hidden className="px-4 py-2 sm:px-6 lg:px-8">
      <div className="section-divider" />
    </div>
  );
}

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openChat = () => {
    setMenuOpen(false);
    setChatOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col overflow-x-clip">
        <a
          href="#main-content"
          className="sr-only z-[70] rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <Navbar onOpenChat={openChat} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
        <main id="main-content" className="flex-1">
          <PrintResume />
          <Hero onOpenChat={openChat} />
          <SkillMarquee />
          <About />
          <Expertise />
          <Experience />
          <Divider />
          <Projects />
          <Divider />
          <Products />
          <Highlights />
          <AiExperience />
          <Toolkit />
          <Divider />
          <Contact />
        </main>
        <Footer />

        {!chatOpen && (
          <button
            type="button"
            onClick={openChat}
            aria-label="Open K-AI chat assistant"
            title="Ask K-AI"
            className="fixed bottom-5 right-5 z-[80] grid h-16 w-16 place-items-center rounded-full bg-white p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] ring-2 ring-primary/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:ring-primary/40 sm:bottom-6 sm:right-6"
          >
            <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
            <span className="relative grid h-full w-full place-items-center rounded-full bg-white">
              <img src="/logo.svg" alt="K-AI" className="h-full w-full rounded-full object-contain" />
            </span>
          </button>
        )}

        <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
        <BackToTop />
        <CommandPalette />
      </div>
    </MotionConfig>
  );
}

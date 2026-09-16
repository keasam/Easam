"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { Bot, X } from "lucide-react";
import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/hero";
import { SkillMarquee } from "@/components/portfolio/marquee";
import { About } from "@/components/portfolio/about";
import { Expertise } from "@/components/portfolio/expertise";
import { Experience } from "@/components/portfolio/experience";
import { Projects } from "@/components/portfolio/projects";
import { Products } from "@/components/portfolio/products";
import { Highlights } from "@/components/portfolio/highlights";
import { FeaturedVideo } from "@/components/portfolio/featured-video";
import { JdMatch } from "@/components/portfolio/jd-match";
import { AiExperience } from "@/components/portfolio/ai-experience";
import { Toolkit } from "@/components/portfolio/toolkit";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";
import { ChatWidget } from "@/components/portfolio/chat-widget";
import { BackToTop } from "@/components/portfolio/back-to-top";
import { PrintResume } from "@/components/portfolio/print-resume";
import { CommandPalette } from "@/components/portfolio/command-palette";

const AUTO_KAI_KEY = "kai-auto-open-v1";

function Divider() {
  return <div aria-hidden className="px-4 py-2 sm:px-6 lg:px-8"><div className="section-divider" /></div>;
}

function KaiAvatar({ small = false }: { small?: boolean }) {
  return <span className={`relative grid place-items-center rounded-full bg-gradient-to-br from-slate-950 via-slate-800 to-primary shadow-lg ring-2 ring-primary/35 ${small ? "h-10 w-10" : "h-14 w-14"}`} aria-hidden><Bot className={small ? "h-5 w-5 text-cyan-200" : "h-7 w-7 text-cyan-200"} /><span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-primary/40 bg-slate-950 px-1.5 py-0.5 font-black leading-none text-primary-foreground ${small ? "text-[7px]" : "text-[9px]"}`}>EK</span></span>;
}

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showKaiNotification, setShowKaiNotification] = useState(false);
  const openChat = () => { setMenuOpen(false); setShowKaiNotification(false); setChatOpen(true); try { sessionStorage.setItem(AUTO_KAI_KEY, "1"); } catch {} };
  useEffect(() => { let alreadyOpened = false; try { alreadyOpened = sessionStorage.getItem(AUTO_KAI_KEY) === "1"; } catch {} if (alreadyOpened || chatOpen) return; const timer = window.setTimeout(() => { if (chatOpen) return; setShowKaiNotification(true); window.setTimeout(() => { setShowKaiNotification(false); setChatOpen(true); try { sessionStorage.setItem(AUTO_KAI_KEY, "1"); } catch {} }, 1200); }, 5000); return () => window.clearTimeout(timer); }, [chatOpen]);

  return <MotionConfig reducedMotion="user"><div className="relative flex min-h-screen flex-col overflow-x-clip">
    <a href="#main-content" className="sr-only z-[70] rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>
    <Navbar onOpenChat={openChat} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    <main id="main-content" className="flex-1"><PrintResume /><Hero onOpenChat={openChat} /><SkillMarquee /><About /><Expertise /><Experience /><Divider /><Projects /><Divider /><Products /><Highlights /><FeaturedVideo /><JdMatch /><AiExperience /><Toolkit /><Divider /><Contact /></main>
    <Footer />
    {!chatOpen && <><>{showKaiNotification && <div className="fixed bottom-24 right-5 z-[81] w-[min(330px,calc(100vw-2.5rem))] sm:bottom-24 sm:right-6"><div className="relative flex items-center gap-3 rounded-2xl border border-primary/20 bg-white/95 p-3.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl"><button type="button" onClick={() => setShowKaiNotification(false)} aria-label="Dismiss K-AI notification" className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><X className="h-3.5 w-3.5" /></button><KaiAvatar small /><div className="pr-5"><p className="text-sm font-extrabold">Need any information?</p><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Ask K-AI about Karthik&apos;s experience, projects and skills.</p></div></div></div>}</><button type="button" onClick={openChat} aria-label="Open K-AI chat assistant" title="Ask K-AI" className="fixed bottom-5 right-5 z-[80] grid h-16 w-16 place-items-center rounded-full bg-white shadow-[0_12px_35px_rgba(0,0,0,0.18)] ring-2 ring-primary/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:ring-primary/40 sm:bottom-6 sm:right-6"><span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" /><span className="relative"><KaiAvatar /></span><span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-md">AI</span></button></>}
    <ChatWidget open={chatOpen} onOpenChange={setChatOpen} /><BackToTop /><CommandPalette />
  </div></MotionConfig>;
}

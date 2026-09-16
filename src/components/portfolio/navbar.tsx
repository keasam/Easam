"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Bot, Keyboard, Menu, X, Command as CommandIcon, Sparkles } from "lucide-react";
import { profile } from "@/lib/resume-data";
import { usePlatformKeys } from "@/hooks/use-platform-keys";
const links = [
  { label: "About", href: "#about" },
  { label: "Expertise", href: "#expertise" },
  { label: "Journey", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Products", href: "#products" },
  { label: "AI Match", href: "#jd-match", featured: true },
  { label: "Contact", href: "#contact" },
];

export function Navbar({
  onOpenChat,
  menuOpen,
  onMenuOpenChange,
}: {
  onOpenChat: () => void;
  menuOpen: boolean;
  onMenuOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const { comboK, isMac } = usePlatformKeys();
  const ComboIcon = isMac ? CommandIcon : Keyboard;
  const open = menuOpen;
  const setOpen = onMenuOpenChange;
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 transition-all duration-300 ${
        open ? "z-[70]" : "z-50"
      } ${
        scrolled ? "glass-nav shadow-[0_6px_24px_oklch(0.55_0.07_185/0.08)]" : "bg-transparent"
      }`}
    >
      <motion.div
        style={{ scaleX: progress }}
        className="absolute top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-primary via-emerald-400 to-amber-400"
      />
      <motion.nav
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mx-auto flex h-16 md:h-[72px] max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8"
      >
        <a href="#top" className="group flex shrink-0 items-center gap-3" aria-label="Back to top">
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-white/90 shadow-lg shadow-primary/15 ring-2 ring-primary/20 transition-transform duration-300 group-hover:scale-105">
            <img src="/images/karthik-photo.jpg" alt="Karthik Easam" className="h-full w-full object-cover" />
          </span>
          <span className="hidden lg:flex flex-col leading-tight whitespace-nowrap">
            <span className="text-sm font-extrabold tracking-tight">{profile.name}</span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {profile.title} · 9+ yrs
            </span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-0.5 lg:gap-1 rounded-full border border-primary/10 bg-white/70 px-2 py-1.5 shadow-sm">
          {links.map((l) => {
            const isActive = active === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? "true" : undefined}
                className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors xl:px-4 xl:text-sm ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-md shadow-primary/25"
                    : l.featured
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 hover:text-amber-800"
                      : "text-muted-foreground hover:bg-secondary hover:text-primary"
                }`}
              >
                {l.featured && <Sparkles className="mr-1 inline-block h-3.5 w-3.5" />}
                {l.label}
              </a>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("palette:open"))}
            aria-label="Open quick actions (Command K)"
            title={`Quick actions (${comboK})`}
            className="hidden lg:inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-primary/15 bg-white/70 px-3 text-xs font-bold text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
          >
            <ComboIcon className="h-3.5 w-3.5 text-primary" />
            <kbd className="font-extrabold tracking-widest">{comboK}</kbd>
          </button>
          <button
            onClick={onOpenChat}
            className="hidden md:inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-emerald-500 px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 lg:px-4"
          >
            <Bot className="h-4 w-4" />
            Ask K-AI
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl border border-primary/15 bg-white/80 text-primary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-b border-primary/10 bg-white/95 shadow-xl backdrop-blur-xl"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((l) => {
                const isActive = active === l.href;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-secondary text-primary"
                        : l.featured
                          ? "bg-amber-50 text-amber-700"
                          : "text-muted-foreground hover:bg-secondary hover:text-primary"
                    }`}
                  >
                    {l.featured && <Sparkles className="mr-2 inline-block h-4 w-4" />}
                    {l.label}
                  </a>
                );
              })}
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenChat();
                }}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-105 active:scale-[0.98]"
              >
                <Bot className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" /> Ask K-AI Assistant
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("palette:open"));
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/15 bg-white px-4 py-3 text-sm font-bold text-primary shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
              >
                <ComboIcon className="h-4 w-4" /> Quick actions
                <kbd className="ml-1 rounded-md border border-primary/15 bg-secondary px-1.5 py-0.5 text-[10px] font-extrabold">
                  {comboK}
                </kbd>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

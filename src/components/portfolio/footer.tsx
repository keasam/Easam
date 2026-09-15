"use client";

import { Bot, Command as CommandIcon, FileDown, Heart, Keyboard, Linkedin, Mail, Phone } from "lucide-react";
import { profile } from "@/lib/resume-data";
import { usePlatformKeys } from "@/hooks/use-platform-keys";

export function Footer() {
  const { comboK, isMac } = usePlatformKeys();
  const ComboIcon = isMac ? CommandIcon : Keyboard;
  return (
    <footer className="relative mt-auto border-t border-primary/10 bg-white/70 backdrop-blur">
      {/* gradient top hairline */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary/60 via-emerald-400/60 to-amber-400/60" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-sm font-extrabold text-white shadow-lg shadow-primary/25">
              {profile.initials}
            </span>
            <div>
              <p className="text-sm font-extrabold tracking-tight">{profile.name}</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {profile.title} · {profile.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {[
              { icon: Mail, href: `mailto:${profile.email}`, label: "Email Karthik" },
              { icon: Phone, href: profile.phoneHref, label: "Call Karthik" },
              { icon: Linkedin, href: profile.linkedinHref, label: "LinkedIn profile" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-xl border border-primary/15 bg-white text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-primary/10 pt-6 text-xs font-semibold text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="/api/resume/pdf"
              download="Karthik-Easam-Project-Manager-Resume.pdf"
              className="no-print inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 px-3.5 py-1.5 font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              <FileDown className="h-3.5 w-3.5" />
              Resume (PDF)
            </a>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("palette:open"))}
              className="no-print inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white px-3 py-1.5 font-bold text-primary transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <ComboIcon className="h-3.5 w-3.5" />
              Quick actions
              <kbd className="rounded border border-primary/15 bg-secondary px-1 text-[10px] font-extrabold">
                {comboK}
              </kbd>
            </button>
          </div>
          <p className="inline-flex items-center gap-1.5">
            Crafted with
            <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            and powered by
            <span className="inline-flex items-center gap-1 font-extrabold text-primary">
              <Bot className="h-3.5 w-3.5" /> K-AI
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

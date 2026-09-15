"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlatformKeys } from "@/hooks/use-platform-keys";
import {
  BarChart3,
  Bot,
  Calendar,
  Copy,
  Cpu,
  FileDown,
  FolderGit2,
  GraduationCap,
  Highlighter,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Printer,
  Rocket,
  Share2,
  Sparkles,
  Target,
  User,
  Wrench,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { askKai, downloadVCard, scrollToSection } from "@/lib/vcard";
import { fetchFeedbackDetailed } from "@/lib/kai-feedback-client";

const SECTIONS = [
  { id: "about", label: "About Karthik", icon: User },
  { id: "expertise", label: "Expertise", icon: Target },
  { id: "experience", label: "Career Journey", icon: Calendar },
  { id: "projects", label: "Flagship Projects", icon: FolderGit2 },
  { id: "products", label: "IoT Product Portfolio", icon: Cpu },
  { id: "highlights", label: "Highlights", icon: Highlighter },
  { id: "ai", label: "K-AI Experience", icon: Sparkles },
  { id: "toolkit", label: "Toolkit & Education", icon: GraduationCap },
  { id: "contact", label: "Contact", icon: Mail },
];

const AI_QUESTIONS = [
  { q: "Summarize Karthik's experience", icon: Rocket },
  { q: "Tell me about OfficeGX", icon: Layers },
  { q: "What projects has he delivered?", icon: FolderGit2 },
  { q: "Tell me about his IoT products — SmartPile, SmartWaterMonitor, SmartFieldSheet", icon: Cpu },
  { q: "How does he manage risk?", icon: Target },
  { q: "Has he worked with US stakeholders?", icon: MapPin },
  { q: "What's the best way to contact him?", icon: Mail },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { comboK, comboP } = usePlatformKeys();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        // Print shortcut — works with the browser's own Ctrl+P on Windows.
        e.preventDefault();
        window.print();
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpenEvent);
    };
  }, []);

  // one-time keyboard hint for first-time visitors (desktop only)
  useEffect(() => {
    const HINT_KEY = "kai-kbd-hint-shown-v1";
    let seen = false;
    try {
      seen = localStorage.getItem(HINT_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen || window.matchMedia("(pointer: coarse)").matches) return;
    const timer = setTimeout(() => {
      toast({
        title: `Pro tip: press ${comboK} anywhere ⌨️`,
        description: "Jump to sections, ask K-AI, or grab Karthik's resume in one keystroke.",
        duration: 7000,
      });
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 9000);
    return () => clearTimeout(timer);
  }, [toast, comboK]);

  const run = useCallback(
    (action: () => void) => {
      setOpen(false);
      // let the dialog close before jumping
      setTimeout(action, 120);
    },
    []
  );

  const copy = useCallback(
    async (value: string, label: string) => {
      try {
        await navigator.clipboard.writeText(value);
        toast({ title: `${label} copied`, description: value });
      } catch {
        toast({ title: "Couldn't copy", description: value, variant: "destructive" });
      }
      setOpen(false);
    },
    [toast]
  );

  /** Share the portfolio via the Web Share API (clipboard fallback) */
  const sharePortfolio = useCallback(async () => {
    const url = window.location.origin;
    const data = {
      title: "Karthik Easam — Project Manager",
      text: "Karthik's interactive, AI-powered portfolio — chat with his resume",
      url,
    };
    setOpen(false);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(data);
        return;
      }
      throw new Error("share-unavailable");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      // fallback: copy the link so it can be pasted anywhere
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Portfolio link copied 🔗",
          description: "Paste it in a message to share Karthik's portfolio.",
        });
      } catch {
        toast({ title: "Copy this link to share", description: url });
      }
    }
  }, [toast]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Quick actions"
      description="Jump to a section, ask K-AI, or grab Karthik's details"
      className="rounded-2xl border-primary/15 bg-white/95 shadow-2xl shadow-primary/20 backdrop-blur-xl [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-extrabold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-primary/70 [&_[cmdk-input-wrapper]_svg]:text-primary [&_[cmdk-item]]:rounded-xl [&_[cmdk-item]]:py-2.5 data-[state=open]:animate-in"
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList className="thin-scrollbar max-h-[380px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Ask K-AI">
          {AI_QUESTIONS.map(({ q, icon: Icon }) => (
            <CommandItem
              key={q}
              value={`ask ${q}`}
              onSelect={() => run(() => askKai(q))}
              className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-emerald-500 text-white shadow-sm transition-transform group-hover:scale-110">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold">{q}</span>
              <CommandShortcut>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Documents & actions">
          <CommandItem
            value="download resume pdf"
            onSelect={() => run(() => window.open("/api/resume/pdf", "_blank"))}
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <FileDown className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">Download resume (PDF)</span>
            <CommandShortcut>PDF</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="print resume"
            onSelect={() =>
              run(() => {
                toast({
                  title: "Preparing print view 🖨️",
                  description: "Choose “Save as PDF” in the print dialog to keep a copy.",
                });
                setTimeout(() => window.print(), 350);
              })
            }
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <Printer className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">Print this portfolio</span>
            <CommandShortcut>{comboP}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="save contact card vcf"
            onSelect={() =>
              run(() => {
                downloadVCard();
                toast({
                  title: "Contact card downloaded 📇",
                  description: "Open the .vcf file to add Karthik straight to your contacts.",
                });
              })
            }
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">Save contact card (.vcf)</span>
          </CommandItem>
          <CommandItem
            value="open linkedin"
            onSelect={() => run(() => window.open("https://linkedin.com/in/easamkarthik", "_blank"))}
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <Linkedin className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">Open LinkedIn profile</span>
          </CommandItem>
          <CommandItem
            value="share this portfolio link"
            onSelect={() => run(() => void sharePortfolio())}
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <Share2 className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">Share this portfolio</span>
            <CommandShortcut className="normal-case tracking-normal">link</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="kai owner stats ratings"
            onSelect={() =>
              run(async () => {
                const stats = await fetchFeedbackDetailed();
                if (!stats) {
                  toast({
                    title: "Stats unavailable",
                    description: "Could not reach the feedback store right now.",
                    variant: "destructive",
                  });
                  return;
                }
                if (stats.total === 0) {
                  toast({
                    title: "K-AI owner stats 📊",
                    description:
                      "No ratings yet — the helpful % builds as visitors rate answers.",
                  });
                  return;
                }
                const last = stats.recent?.[0];
                const latest = last
                  ? last.asked
                    ? `latest ask: “${last.asked.slice(0, 60)}”`
                    : `latest: ${new Date(last.at).toLocaleString()}`
                  : null;
                const top = stats.sections?.find((s) => s.up > 0);
                const topArea = top
                  ? `most-loved area: ${top.section} (${top.up}/${top.total} 👍)`
                  : null;
                toast({
                  title: "K-AI owner stats 📊",
                  description: `${stats.total} rating${stats.total === 1 ? "" : "s"} · ${stats.pct}% helpful · ${stats.down} needed work${topArea ? ` · ${topArea}` : ""}${latest ? ` · ${latest}` : ""}`,
                  duration: 9000,
                });
              })
            }
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">K-AI owner stats (ratings)</span>
            <CommandShortcut>
              <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem
            value="copy email"
            onSelect={() => run(() => copy("easamkarthik@gmail.com", "Email"))}
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <Mail className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">Copy email address</span>
            <CommandShortcut>
              <Copy className="h-3.5 w-3.5" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem
            value="copy phone number"
            onSelect={() => run(() => copy("+91 91607 84194", "Phone"))}
            className="group data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary shadow-sm transition-transform group-hover:scale-110">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold">Copy phone number</span>
            <CommandShortcut>
              <Copy className="h-3.5 w-3.5" />
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Jump to section">
          <CommandItem
            value="top hero"
            onSelect={() => run(() => scrollToSection("top"))}
            className="data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
          >
            <Rocket className="text-primary" />
            <span className="font-semibold">Back to top</span>
          </CommandItem>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <CommandItem
              key={id}
              value={`go to ${label}`}
              onSelect={() => run(() => scrollToSection(id))}
              className="data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
            >
              <Icon className="text-primary" />
              <span className="font-semibold">{label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Toolkit quick search">
          {["Jira", "Azure", "Agile", "Scrum", "Risk Management", "UAT"].map((tool) => (
            <CommandItem
              key={tool}
              value={`tool ${tool}`}
              onSelect={() => run(() => scrollToSection("toolkit"))}
              className="data-[selected=true]:bg-secondary data-[selected=true]:text-primary"
            >
              <Wrench className="text-primary" />
              <span className="font-semibold">{tool}</span>
              <CommandShortcut className="normal-case tracking-normal">in Toolkit</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between border-t border-primary/10 bg-secondary/40 px-4 py-2.5 text-[11px] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 text-primary" />
          Powered by K-AI
        </span>
        <span>
          <kbd className="rounded-md border border-primary/15 bg-white px-1.5 py-0.5 font-bold text-primary shadow-sm">
            {comboK}
          </kbd>{" "}
          to toggle
        </span>
      </div>
    </CommandDialog>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  ContactRound,
  FileDown,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Printer,
  Send,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { profile } from "@/lib/resume-data";
import { useToast } from "@/hooks/use-toast";
import { downloadVCard as downloadVCardFile } from "@/lib/vcard";

const contactCards = [
  {
    icon: Mail,
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    accent: "teal" as const,
  },
  {
    icon: Phone,
    label: "Phone",
    value: profile.phone,
    href: profile.phoneHref,
    accent: "amber" as const,
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "in/easamkarthik",
    href: profile.linkedinHref,
    accent: "teal" as const,
  },
  {
    icon: MapPin,
    label: "Location",
    value: profile.location,
    href: undefined,
    accent: "amber" as const,
  },
];

export function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const downloadVCard = () => {
    downloadVCardFile();
    toast({
      title: "Contact card downloaded 📇",
      description: "Open the .vcf file to add Karthik straight to your contacts.",
    });
  };

  const printResume = () => {
    toast({
      title: "Preparing print view 🖨️",
      description: "Choose “Save as PDF” in the print dialog to keep a copy.",
    });
    setTimeout(() => window.print(), 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Name, email and a short message help Karthik reply faster.",
        variant: "destructive",
      });
      return;
    }
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(
      `Hi Karthik,\n\n${message}\n\n— ${name}\n${email}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
    toast({
      title: "Opening your mail app…",
      description: "Your message is pre-filled and ready to send to Karthik.",
    });
  };

  return (
    <section id="contact" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Let's build something"
          highlight="worth shipping"
          description="Hiring, consulting, or collaboration — Karthik replies within one business day."
        />

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* contact channels */}
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {contactCards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="lift"
              >
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="lift card-glow flex h-full flex-col gap-3 rounded-3xl border border-primary/10 bg-white/85 p-5 shadow-sm backdrop-blur"
                  >
                    <CardInner card={c} />
                  </a>
                ) : (
                  <div className="lift card-glow flex h-full flex-col gap-3 rounded-3xl border border-primary/10 bg-white/85 p-5 shadow-sm backdrop-blur">
                    <CardInner card={c} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* availability banner */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-secondary/60 p-5 shadow-sm sm:col-span-2"
            >
              <div className="flex items-center gap-4">
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                  <CalendarClock className="h-5 w-5" />
                  <span className="absolute inset-0 animate-pulse-ring rounded-2xl" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-emerald-900">
                    Currently managing 7+ projects — open to the right next move
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-700/80">
                    Response time: usually within one business day
                  </p>
                </div>
              </div>
            </motion.div>

            {/* vCard download */}
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.36, duration: 0.45 }}
              onClick={downloadVCard}
              className="lift card-glow group flex items-center gap-4 rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-50 via-white to-accent/40 p-5 text-left shadow-sm backdrop-blur sm:col-span-2"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-400/30 transition-transform group-hover:rotate-6 group-hover:scale-110">
                <ContactRound className="h-5.5 w-5.5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-amber-900">
                  Save Karthik&apos;s contact card
                </p>
                <p className="mt-0.5 text-xs font-semibold text-amber-700/80">
                  Downloads a vCard (.vcf) — phone, email &amp; LinkedIn in one tap
                </p>
              </div>
              <ContactRound className="h-4 w-4 shrink-0 text-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>

            {/* direct resume PDF download */}
            <motion.a
              href="/api/resume/pdf"
              download="Karthik-Easam-Project-Manager-Resume.pdf"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.39, duration: 0.45 }}
              onClick={() =>
                toast({
                  title: "Resume PDF downloading 📄",
                  description: "A clean ATS-friendly resume, generated live on the server.",
                })
              }
              className="lift card-glow group flex items-center gap-4 rounded-3xl border border-emerald-300/40 bg-gradient-to-br from-emerald-50 via-white to-secondary/60 p-5 text-left shadow-sm backdrop-blur sm:col-span-2"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-primary text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:rotate-6 group-hover:scale-110">
                <FileDown className="h-5.5 w-5.5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-emerald-900">
                  Download the resume (PDF) — one tap
                </p>
                <p className="mt-0.5 text-xs font-semibold text-emerald-700/80">
                  Server-generated ATS layout — no print dialog needed
                </p>
              </div>
              <FileDown className="h-4 w-4 shrink-0 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.a>

            {/* print resume */}
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.42, duration: 0.45 }}
              onClick={printResume}
              className="lift card-glow group flex items-center gap-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary/70 via-white to-emerald-50 p-5 text-left shadow-sm backdrop-blur sm:col-span-2"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/30 transition-transform group-hover:-rotate-6 group-hover:scale-110">
                <Printer className="h-5.5 w-5.5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-primary">
                  Print / save a clean resume (PDF)
                </p>
                <p className="mt-0.5 text-xs font-semibold text-primary/70">
                  Opens a recruiter-friendly one-column layout — pick “Save as PDF”
                </p>
              </div>
              <Printer className="h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          </div>

          {/* form */}
          <motion.form
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-primary/10 bg-white/85 p-6 shadow-lg backdrop-blur md:p-8"
          >
            <h3 className="text-lg font-extrabold tracking-tight">Send a message</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Opens your mail app with everything pre-filled.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Your name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Recruiter"
                  className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Your email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi Karthik — we're looking for a delivery lead for…"
                rows={5}
                className="w-full resize-none rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/35 sm:w-auto"
            >
              {sent ? (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5" /> Ready in your mail app
                </>
              ) : (
                <>
                  <Send className="h-4.5 w-4.5" /> Send Message
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function CardInner({ card }: { card: (typeof contactCards)[number] }) {
  const teal = card.accent === "teal";
  const Icon = card.icon;
  return (
    <>
      <span
        className={`grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg ${
          teal
            ? "bg-gradient-to-br from-primary to-emerald-500 shadow-primary/25"
            : "bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-400/25"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          {card.label}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-foreground">{card.value}</p>
      </div>
    </>
  );
}

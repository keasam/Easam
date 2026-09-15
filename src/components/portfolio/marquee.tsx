"use client";

import {
  BarChart3,
  Boxes,
  Brain,
  ClipboardCheck,
  GitBranch,
  Globe2,
  KanbanSquare,
  LineChart,
  ListChecks,
  Rocket,
  Target,
  Users2,
} from "lucide-react";

const items = [
  { icon: KanbanSquare, label: "Agile Delivery" },
  { icon: Target, label: "Scope & Scheduling" },
  { icon: GitBranch, label: "Release Management" },
  { icon: ListChecks, label: "UAT & Go-Live" },
  { icon: ShieldCheckIcon, label: "RAID / Risk Control" },
  { icon: Users2, label: "30+ Team Leadership" },
  { icon: Brain, label: "AI Product Delivery — Lexa" },
  { icon: Boxes, label: "ERP · CRM · HRMS · ATS" },
  { icon: BarChart3, label: "Executive Reporting" },
  { icon: ClipboardCheck, label: "Process Governance" },
  { icon: Globe2, label: "US Onsite — FL & AZ" },
  { icon: Rocket, label: "Concept → Launch" },
  { icon: LineChart, label: "KPI & SLA Tracking" },
];

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function SkillMarquee() {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-pausing relative border-y border-primary/10 bg-white/60 py-5 backdrop-blur">
      <div className="marquee-mask overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-10 pr-10">
          {doubled.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold text-muted-foreground"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-primary">
                <item.icon className="h-4 w-4" />
              </span>
              {item.label}
              <span className="ml-6 h-1.5 w-1.5 rounded-full bg-amber-400/80" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

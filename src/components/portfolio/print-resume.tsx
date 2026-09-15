"use client";

import {
  deliveryCompetencies,
  education,
  experience,
  leadershipCompetencies,
  methodologies,
  profile,
  tools,
} from "@/lib/resume-data";

/**
 * Hidden on screen (`hidden print:block` via .print-only), rendered as a clean
 * ATS-friendly resume when the user prints / saves as PDF via window.print().
 */
export function PrintResume() {
  return (
    <section className="print-only print-sheet hidden px-6" aria-label="Printable resume">
      {/* header */}
      <header className="text-center">
        <h1 className="text-[26px] font-extrabold tracking-tight">{profile.name}</h1>
        <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.18em] text-[oklch(0.5_0.09_184)]">
          {profile.title} · Software Delivery
        </p>
        <p className="mt-2 text-[11.5px]">
          {profile.email} &nbsp;·&nbsp; {profile.phone} &nbsp;·&nbsp; {profile.location}
          <br />
          {profile.linkedinHref.replace("https://", "")}
        </p>
      </header>

      {/* summary */}
      <h2>Professional Summary</h2>
      <p>{profile.summaryIntro}</p>
      <p className="mt-1.5">{profile.summaryBody}</p>
      <p className="mt-1.5">{profile.summaryProof}</p>

      {/* competencies */}
      <h2>Core Competencies</h2>
      <div className="grid grid-cols-2 gap-x-6">
        <ul className="list-disc pl-4">
          {deliveryCompetencies.map((c) => (
            <li key={c} className="print-item">
              {c}
            </li>
          ))}
        </ul>
        <ul className="list-disc pl-4">
          {leadershipCompetencies.map((c) => (
            <li key={c} className="print-item">
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* experience */}
      <h2>Professional Experience</h2>
      {experience.map((job) => (
        <div key={job.role} className="print-item">
          <p className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-[13.5px] font-extrabold">
              {job.role} — {job.company}
            </span>
            <span className="text-[11px] font-semibold">{job.period}</span>
          </p>
          <p className="text-[11px] italic">{job.location}</p>
          <ul className="mt-1 list-disc pl-4">
            {job.points.map((p, i) => (
              <li key={i}>{p.text}</li>
            ))}
          </ul>
          {job.subProjects?.map((sp) => (
            <div key={sp.name} className="mt-1.5 pl-4">
              <p className="text-[12px] font-bold">
                {sp.name} <span className="font-medium italic">— {sp.tagline}</span>
              </p>
              <p>{sp.description}</p>
            </div>
          ))}
        </div>
      ))}

      {/* toolkit */}
      <h2>Methodologies &amp; Tools</h2>
      <p>
        <span className="font-bold">Methodologies: </span>
        {methodologies.join(" · ")}
      </p>
      <p className="mt-1">
        <span className="font-bold">Tools: </span>
        {tools.join(" · ")}
      </p>

      {/* education */}
      <h2>Education</h2>
      <p className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-[13px] font-extrabold">
          {education.degree} — {education.school}
        </span>
        <span className="text-[11px] font-semibold">{education.period}</span>
      </p>
    </section>
  );
}

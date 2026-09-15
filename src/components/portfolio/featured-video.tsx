"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { SectionHeading } from "./section-heading";

export function FeaturedVideo() {
  return (
    <section id="featured-video" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Video"
          title="Watch"
          highlight="Karthik in action"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="card-glow overflow-hidden rounded-3xl border border-primary/10 bg-white/85 p-2 shadow-sm backdrop-blur sm:p-3"
        >
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
            <div className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur">
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </div>
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/caHCtlbXgbg?si=KslvfgLsE0-8RrHj&cc_load_policy=0"
              title="Featured video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { profile } from "@/lib/resume-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title} | Interactive AI Portfolio`,
  description:
    "Interactive AI-driven portfolio of Karthik Easam — Project Manager with 9+ years delivering ERP, LegalTech and enterprise software. Chat with K-AI, his resume assistant.",
  keywords: [
    "Karthik Easam",
    "Project Manager",
    "Software Delivery",
    "Agile",
    "Scrum",
    "ERP",
    "LegalTech",
    "Portfolio",
  ],
  authors: [{ name: profile.name }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description:
      "9+ years of end-to-end software delivery. Explore an AI-powered portfolio and ask K-AI anything about Karthik's experience.",
    siteName: `${profile.name} Portfolio`,
    type: "website",
    images: [
      {
        url: "/images/og-card.jpg",
        width: 1200,
        height: 630,
        alt: `${profile.name} — ${profile.title} · AI-powered portfolio with K-AI resume assistant`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description:
      "AI-driven interactive portfolio — chat with K-AI, a resume assistant grounded in Karthik's 9+ years of ERP & LegalTech delivery.",
    images: ["/images/og-card.jpg"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  telephone: profile.phone,
  url: profile.linkedinHref,
  sameAs: [profile.linkedinHref],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  worksFor: {
    "@type": "Organization",
    name: "RedandBlue Applied Innovations Pvt. Ltd.",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "CMR Engineering College",
  },
  knowsAbout: [
    "Project Management",
    "Agile",
    "Scrum",
    "Software Delivery",
    "ERP",
    "LegalTech",
    "Risk Management",
    "UAT",
    "Release Management",
  ],
  description:
    "Project Manager with 9+ years of end-to-end software delivery experience across ERP, LegalTech, and civil-engineering platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import { profile } from "@/lib/resume-data";

/** Build and download Karthik's vCard (.vcf) — shared by Contact section & command palette */
export function downloadVCard() {
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Easam;Karthik;;;",
    "FN:Karthik Easam",
    "TITLE:Project Manager — Software Delivery",
    "ORG:RedandBlue Applied Innovations Pvt. Ltd.",
    "TEL;TYPE=CELL:+919160784194",
    "EMAIL;TYPE=INTERNET:easamkarthik@gmail.com",
    "URL:https://linkedin.com/in/easamkarthik",
    "ADR;TYPE=WORK:;;;Hyderabad;Telangana;India",
    "NOTE:9+ yrs end-to-end software delivery — ERP (OfficeGX), LegalTech (eLegum), Agile/Scrum, RAID, UAT & release management.",
    "END:VCARD",
  ].join("\r\n");
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "karthik-easam-contact.vcf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Smooth-scroll to a section id (respects scroll-margin-top) */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Ask K-AI a question (opens the chat and sends) — consumed by chat-widget */
export function askKai(question?: string) {
  window.dispatchEvent(new CustomEvent("kai:ask", { detail: { question } }));
}

export const paletteActions = {
  askKai,
  downloadVCard,
  scrollToSection,
  resumePdfUrl: "/api/resume/pdf",
};

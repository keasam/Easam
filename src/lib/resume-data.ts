export const profile = {
  name: "Karthik Easam",
  firstName: "Karthik",
  initials: "KE",
  title: "Project Manager",
  /**
   * Avatar photo shown in the hero card (and used for the favicon).
   * Currently Karthik's real headshot (from /upload/websiteprofile.jpg).
   * To swap it again: drop a new image into /public/images/ and update
   * this path — e.g. avatarUrl: "/images/new-photo.jpg". The og-card.jpg
   * link-preview image is generated separately.
   */
  avatarUrl: "/images/karthik-photo.jpg",
  tagline:
    "Project Manager | Software Delivery | Agile/Scrum | Stakeholder & Risk Management",
  roles: [
    "Project Manager",
    "Software Delivery Lead",
    "Agile / Scrum Practitioner",
    "Stakeholder & Risk Manager",
    "ERP & LegalTech Deliverer",
  ],
  location: "Hyderabad, Telangana, India",
  phone: "+91 91607 84194",
  phoneHref: "tel:+919160784194",
  email: "easamkarthik@gmail.com",
  linkedin: "linkedin.com/in/easamkarthik",
  linkedinHref: "https://linkedin.com/in/easamkarthik",
  summaryIntro:
    "Project Manager with 9+ years of experience leading end-to-end delivery of software and business initiatives — from requirements and planning through development, UAT, release, and post-production support.",
  summaryBody:
    "Currently managing a portfolio of 7+ concurrent projects and 9+ client relationships, owning scope, schedule, resourcing, risk, and stakeholder communication while coordinating 30+ cross-functional team members across Product, Engineering, QA, UI/UX, Operations, and Finance.",
  summaryProof:
    "Proven track record delivering platforms end-to-end — including a six-module ERP system built from the ground up and a LegalTech platform taken from concept to launch — plus a portfolio of IoT and digital infrastructure products spanning embedded sensors, hardware, wireless connectivity, mobile applications, cloud platforms, analytics, automated reporting, and real-time monitoring across construction and geotechnical domains, with direct experience partnering with US-based stakeholders onsite in Florida and Arizona.",
};

export const stats = [
  { value: 9, suffix: "+", label: "Years of Experience", icon: "calendar" },
  { value: 7, suffix: "+", label: "Concurrent Projects", icon: "folders" },
  { value: 9, suffix: "+", label: "Client Relationships", icon: "handshake" },
  { value: 30, suffix: "+", label: "Team Members Led", icon: "users" },
  { value: 30, suffix: "+", label: "Vendors & Partners", icon: "network" },
  { value: 6, suffix: "", label: "ERP Modules Delivered", icon: "layers" },
];

export const deliveryCompetencies = [
  "End-to-End Project Management",
  "Project Planning, Scope & Scheduling",
  "Budget & Resource Alignment",
  "RAID / Risk & Issue Management",
  "Change Request Management",
  "Release & Implementation Management",
  "UAT & Go-Live Coordination",
  "Post-Production Support",
];

export const leadershipCompetencies = [
  "Client & Executive Relationship Management",
  "Cross-Functional Team Leadership (30+)",
  "Stakeholder & Expectation Management",
  "Escalation & Issue Resolution",
  "Vendor & Partner Management",
  "Executive & Status Reporting",
  "Agile / Scrum / SDLC",
  "Process Improvement & Governance",
];

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  start: string;
  current?: boolean;
  icon: string;
  points: { text: string; bold?: string }[];
  /** Tailored question sent to K-AI from this role's "Ask K-AI" pill */
  kaiQuestion?: string;
  subProjects?: {
    name: string;
    tagline: string;
    description: string;
    tags: string[];
    points: string[];
  }[];
}

export const experience: ExperienceItem[] = [
  {
    role: "Executive Manager (Project Management)",
    company: "RedandBlue Applied Innovations Pvt. Ltd.",
    location: "Hyderabad, India",
    period: "June 2023 – Present",
    start: "2023",
    current: true,
    icon: "rocket",
    kaiQuestion:
      "What does Karthik's current Executive Manager role at RedandBlue involve day-to-day, and what has he delivered there?",
    points: [
      {
        text: "Own end-to-end delivery of 7+ concurrent software and business initiatives, managing scope, schedule, budget alignment, resourcing, and risk from requirements through go-live and post-production support.",
        bold: "7+ concurrent projects",
      },
      {
        text: "Serve as primary project and client point of contact for 9+ stakeholders, driving requirements gathering, expectation management, and escalation resolution to protect delivery commitments.",
        bold: "9+ stakeholders",
      },
      {
        text: "Lead cross-functional delivery teams of 30+ across Product, Engineering, QA, UI/UX, Operations, and Finance, holding teams accountable to milestones, dependencies, and release timelines.",
        bold: "30+ team members",
      },
      {
        text: "Manage project risk and issues (RAID) proactively — identifying blockers, dependencies, and scope changes early, and driving mitigation plans through to closure.",
        bold: "RAID management",
      },
      {
        text: "Own UAT and release management end-to-end: coordinating business validation, sign-off, defect triage, implementation readiness, and go-live execution.",
        bold: "UAT & release ownership",
      },
      {
        text: "Deliver executive and stakeholder reporting — status updates, risk/issue trackers, and milestone reports — enabling leadership decision-making across a multi-project portfolio.",
        bold: "Executive reporting",
      },
      {
        text: "Manage vendor and partner relationships (30+), aligning external dependencies and service delivery with internal project timelines.",
        bold: "30+ vendors & partners",
      },
      {
        text: "Drive process improvement and delivery governance, standardizing project documentation and workflows to improve delivery efficiency and audit readiness.",
        bold: "Process governance",
      },
    ],
    subProjects: [
      {
        name: "OfficeGX — Integrated ERP Platform",
        tagline: "Six-module ERP built from scratch",
        description:
          "Led project delivery coordination for an integrated ERP platform built from scratch spanning six business modules.",
        tags: ["CRM", "Project Management", "HRMS", "ATS", "Sales & Purchasing", "Payroll"],
        points: [
          "Owned product delivery lifecycle from ideation and requirements through planning, development, testing, UAT, release, and continuous improvement across six business modules.",
          "Translated business requirements into actionable project deliverables, coordinating Product, Engineering, UI/UX, and QA teams throughout.",
          "Tracked delivery against milestones and dependencies across multiple product modules, resolving blockers to protect timelines.",
          "Led UAT validation with business users and managed defects, change requests, and implementation issues through resolution.",
          "Coordinated release readiness and production deployment, converting user feedback into enhancement priorities.",
        ],
      },
      {
        name: "eLegum — LegalTech Platform",
        tagline: "Concept to launch LegalTech platform",
        description:
          "Led delivery of a LegalTech platform from concept through launch and ongoing enhancement, coordinating Product, Engineering, UI/UX, QA, and Operations.",
        tags: ["Case Submission", "Advocate Consultation", "Appointments", "Payments", "Documents", "Lexa AI"],
        points: [
          "Gathered and prioritized customer requirements, coordinating workflows for case submission, advocate consultation, appointment booking, payments, and document management.",
          "Owned UAT, release readiness, and post-launch improvements, tracking defects and production issues through resolution.",
          "Supported delivery of Lexa, an AI-powered legal assistant, from development through implementation.",
        ],
      },
    ],
  },
  {
    role: "QA Software Tester",
    company: "Radise India Private Limited",
    location: "Hyderabad, India & Florida, USA",
    period: "January 2020 – June 2023",
    start: "2020",
    icon: "microscope",
    kaiQuestion:
      "How did Karthik move from QA software testing into project management at Radise India?",
    points: [
      {
        text: "Owned end-to-end delivery of Smart FieldSheet, translating civil engineering field workflows into digitized product requirements — shifting field teams from a manual, paper-based process to a software-based workflow.",
        bold: "Smart FieldSheet",
      },
      {
        text: "Sustained the SmartPile Inspector platform by balancing customer-reported needs against technical priorities in the backlog, maintaining platform stability and reliability for civil infrastructure monitoring.",
        bold: "SmartPile Inspector",
      },
      {
        text: "Partnered with Engineering and Hardware teams to define requirements for IoT sensor integration, enabling real-time lifecycle monitoring for civil structures including bridges and piles.",
        bold: "IoT sensor integration",
      },
      {
        text: "Guided development of a Quality Management System (QMS) by translating regulatory compliance needs into product features, meeting formal civil-engineering compliance standards.",
        bold: "Quality Management System",
      },
      {
        text: "Validated releases by running functional, integration, regression, and UAT cycles against defined acceptance criteria, reducing post-launch defect risk.",
        bold: "Release validation",
      },
      {
        text: "Facilitated sprint ceremonies and coordinated with the onsite Florida-based team to align sprint goals with client deployment timelines.",
        bold: "Sprint facilitation",
      },
    ],
    subProjects: [
      {
        name: "SmartPile® Inspector / Duplex",
        tagline: "IoT pile-driving & integrity monitoring",
        description:
          "IoT-enabled pile-driving and integrity monitoring solution using audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting.",
        tags: ["IoT", "Audio Sensors", "Embedded Sensors", "Blow Counting", "Driving Stress", "Automated Reporting", "Field Deployment"],
        points: [
          "Owned development of the IoT-enabled pile-driving and integrity monitoring solution using audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting.",
          "Managed product requirements, roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.",
        ],
      },
      {
        name: "SmartPile® EDC",
        tagline: "Embedded structural sensing",
        description:
          "Embedded structural sensing solution for collecting strain, temperature, and load-related data from piles and concrete structures.",
        tags: ["Embedded Sensing", "Strain & Temperature", "Wireless Communication", "Data Acquisition", "Structural Monitoring"],
        points: [
          "Managed an embedded structural sensing solution for collecting strain, temperature, and load-related data from piles and concrete structures.",
          "Coordinated sensor, wireless communication, data acquisition, and software integration for real-time structural monitoring and analysis.",
        ],
      },
      {
        name: "SmartWaterMonitor",
        tagline: "Remote water-level & pressure monitoring",
        description:
          "IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring.",
        tags: ["IoT", "Cellular Connectivity", "Cloud Data", "Alerts", "Dams & Embankments", "Geotechnical"],
        points: [
          "Owned an IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring.",
          "Managed product requirements, integrations, testing, and deployment for applications including dams, embankments, seepage, and geotechnical monitoring.",
        ],
      },
      {
        name: "SmartFieldSheet / SmartDensity",
        tagline: "Mobile field-data collection & QA/QC",
        description:
          "Mobile field-data collection and reporting solution that wirelessly captured density-gauge data and streamlined QA/QC approvals, report generation, and client submission.",
        tags: ["Mobile Data Collection", "Wireless Capture", "Density Gauge", "QA/QC Approvals", "Report Generation", "Workflow Digitization"],
        points: [
          "Managed a mobile field-data collection and reporting solution that wirelessly captured density-gauge data and streamlined QA/QC approvals, report generation, and client submission.",
          "Led product requirements, workflow digitization, testing, and field implementation to replace manual field sheets, data entry, and reporting processes.",
        ],
      },
    ],
  },
  {
    role: "Quality Analyst",
    company: "SuAi, Inc.",
    location: "Hyderabad, India",
    period: "April 2019 – October 2019",
    start: "2019",
    icon: "badgecheck",
    kaiQuestion:
      "What did Karthik do as a Quality Analyst at SuAi, and how did it shape his delivery career?",
    points: [
      {
        text: "Identified process, quality, and delivery gaps through operational analysis, coordinating corrective actions with internal stakeholders.",
        bold: "Operational analysis",
      },
      {
        text: "Delivered management reporting and performance metrics to support process improvement and standardization.",
        bold: "Performance metrics",
      },
    ],
  },
  {
    role: "Process Developer",
    company: "Genpact India Private Limited",
    location: "Hyderabad, India & Arizona, USA",
    period: "August 2016 – February 2019",
    start: "2016",
    icon: "settings",
    kaiQuestion:
      "Tell me about Karthik's Genpact years — the GoDaddy account, his HST 550 hosting certification, leading a 25-member team, and his onsite stint in Arizona.",
    points: [
      {
        text: "Managed a 25-member team for client GoDaddy, delivering daily customer operations and handling 200+ customer interactions daily while maintaining quality and service standards.",
        bold: "client GoDaddy",
      },
      {
        text: "HST 550 certified on Hosting Advanced Tech; trained and coached team members on hosting technology terms, products, and processes while maintaining quality standards.",
        bold: "HST 550 certified on Hosting Advanced Tech",
      },
      {
        text: "Monitored KPIs, productivity, and service-level performance, managing escalations and coordinating resolution with internal stakeholders.",
        bold: "KPI monitoring",
      },
      {
        text: "Led process transitions, training, and operational implementation, identifying bottlenecks and driving improvement initiatives.",
        bold: "Process transitions",
      },
      {
        text: "Selected for onsite assignment in Arizona, USA, collaborating with US-based teams and stakeholders.",
        bold: "Onsite — Arizona, USA",
      },
    ],
  },
];

export const highlights = [
  {
    title: "9+ Years Across Delivery & QA",
    description:
      "Experience spanning project management, software delivery, QA, and business operations.",
    icon: "calendar",
  },
  {
    title: "Multi-Project Portfolio Leadership",
    description:
      "Currently managing 7+ concurrent projects and 9+ client relationships simultaneously.",
    icon: "folders",
  },
  {
    title: "Large Cross-Functional Teams",
    description:
      "Lead delivery teams of 30+ members and coordinate 30+ vendors and partners.",
    icon: "users",
  },
  {
    title: "Platform Builder, Ground Up",
    description:
      "Delivered a six-module ERP platform from scratch and a LegalTech platform from concept to launch.",
    icon: "layers",
  },
  {
    title: "Risk & Release Excellence",
    description:
      "Strong track record in RAID/risk management, UAT ownership, release management, and post-production support.",
    icon: "shield",
  },
  {
    title: "International Delivery",
    description:
      "Onsite delivery experience with US-based stakeholders in Florida and Arizona.",
    icon: "globe",
  },
];

export const methodologies = [
  "Agile",
  "Scrum",
  "SDLC",
  "UAT",
  "Project Lifecycle Management",
  "Risk Management",
  "Change Management",
  "Release Management",
  "Continuous Improvement",
];

export const tools = [
  "Jira",
  "Microsoft Project",
  "Microsoft Excel",
  "PowerPoint",
  "Word",
  "Azure",
  "ERP",
  "CRM",
  "HRMS",
  "ATS",
];

export const education = {
  degree: "Bachelor of Technology — Mechanical Engineering",
  school: "CMR Engineering College",
  period: "2012 – 2016",
};

export const aiSnapshot =
  "Karthik is a delivery-focused Project Manager with 9+ years across ERP, LegalTech, and civil-engineering software. Today he runs a 7+ project portfolio with 9+ clients, leading 30+ cross-functional members — from OfficeGX, a six-module ERP built from scratch, to eLegum, a LegalTech platform with an AI legal assistant called Lexa. Earlier at Radise India he managed an IoT product line — SmartPile® Inspector/Duplex, SmartPile® EDC, SmartWaterMonitor, and SmartFieldSheet/SmartDensity — spanning embedded sensors, hardware, wireless connectivity, cloud platforms, and automated reporting.";

export const resumeFullText = `
KARTHIK EASAM — PROJECT MANAGER | SOFTWARE DELIVERY | AGILE/SCRUM | STAKEHOLDER & RISK MANAGEMENT
Hyderabad, Telangana, India | +91 91607 84194 | easamkarthik@gmail.com | linkedin.com/in/easamkarthik

PROFESSIONAL SUMMARY
Project Manager with 9+ years of experience leading end-to-end delivery of software and business initiatives — from requirements and planning through development, UAT, release, and post-production support. Currently manage a portfolio of 7+ concurrent projects and 9+ client relationships, owning scope, schedule, resourcing, risk, and stakeholder communication while coordinating 30+ cross-functional team members across Product, Engineering, QA, UI/UX, Operations, and Finance.
Proven track record delivering platforms end-to-end, including a six-module ERP system built from the ground up and a LegalTech platform taken from concept to launch. Skilled in Agile/Scrum delivery, RAID and risk management, escalation handling, and executive-level status reporting, with direct experience partnering with US-based stakeholders onsite in Florida and Arizona.

CORE COMPETENCIES
Project & Delivery Management: End-to-End Project Management; Project Planning, Scope & Scheduling; Budget & Resource Alignment; RAID / Risk & Issue Management; Change Request Management; Release & Implementation Management; UAT & Go-Live Coordination; Post-Production Support.
Stakeholder & Team Leadership: Client & Executive Relationship Management; Cross-Functional Team Leadership (30+); Stakeholder & Expectation Management; Escalation & Issue Resolution; Vendor & Partner Management; Executive & Status Reporting; Agile / Scrum / SDLC; Process Improvement & Governance.

PROFESSIONAL EXPERIENCE

EXECUTIVE MANAGER (PROJECT MANAGEMENT) — RedandBlue Applied Innovations Pvt. Ltd. | Hyderabad | June 2023 – Present
- Own end-to-end delivery of 7+ concurrent software and business initiatives, managing scope, schedule, budget alignment, resourcing, and risk from requirements through go-live and post-production support.
- Serve as primary project and client point of contact for 9+ stakeholders, driving requirements gathering, expectation management, and escalation resolution to protect delivery commitments and client satisfaction.
- Lead cross-functional delivery teams of 30+ across Product, Engineering, QA, UI/UX, Operations, and Finance, holding teams accountable to milestones, dependencies, and release timelines.
- Manage project risk and issues (RAID) proactively — identifying blockers, dependencies, and scope changes early, and driving mitigation plans through to closure.
- Own UAT and release management end-to-end: coordinating business validation, sign-off, defect triage, implementation readiness, and go-live execution.
- Deliver executive and stakeholder reporting — status updates, risk/issue trackers, and milestone reports — enabling leadership decision-making across a multi-project portfolio.
- Manage vendor and partner relationships (30+), aligning external dependencies and service delivery with internal project timelines.
- Drive process improvement and delivery governance, standardizing project documentation and workflows to improve delivery efficiency and audit readiness.

Software Product Implementation — OfficeGX (Integrated ERP Platform)
Led project delivery coordination for an integrated ERP platform built from scratch, spanning CRM, Project Management, HRMS, ATS, Sales & Purchasing, and Payroll Automation.
- Owned product delivery lifecycle from ideation and requirements through planning, development, testing, UAT, release, and continuous improvement across six business modules.
- Translated business requirements into actionable project deliverables, coordinating Product, Engineering, UI/UX, and QA teams throughout.
- Tracked delivery against milestones and dependencies across multiple product modules, resolving blockers to protect timelines.
- Led UAT validation with business users and managed defects, change requests, and implementation issues through resolution.
- Coordinated release readiness and production deployment, converting user feedback into enhancement priorities.

Software Product Implementation — eLegum (LegalTech Platform)
- Led delivery of a LegalTech platform from concept through launch and ongoing enhancement, coordinating Product, Engineering, UI/UX, QA, and Operations.
- Gathered and prioritized customer requirements, coordinating workflows for case submission, advocate consultation, appointment booking, payments, and document management.
- Owned UAT, release readiness, and post-launch improvements, tracking defects and production issues through resolution.
- Supported delivery of Lexa, an AI-powered legal assistant, from development through implementation.

QA SOFTWARE TESTER — Radise India Private Limited | Hyderabad & Florida, USA | January 2020 – June 2023
- Owned end-to-end delivery of Smart FieldSheet, translating civil engineering field workflows into digitized product requirements — shifting field teams from a manual, paper-based process to a software-based workflow.
- Sustained the SmartPile Inspector platform by balancing customer-reported needs against technical priorities in the backlog, maintaining platform stability and reliability for civil infrastructure monitoring.
- Partnered with Engineering and Hardware teams to define requirements for IoT sensor integration, enabling real-time lifecycle monitoring for civil structures including bridges and piles.
- Guided development of a Quality Management System (QMS) by translating regulatory compliance needs into product features, meeting formal civil-engineering compliance standards.
- Validated releases by running functional, integration, regression, and UAT cycles against defined acceptance criteria, reducing post-launch defect risk.
- Facilitated sprint ceremonies and coordinated with the onsite Florida-based team to align sprint goals with client deployment timelines.

SOFTWARE PRODUCTS MANAGED — Radise India (IoT & Digital Infrastructure Portfolio)
Managed IoT and digital infrastructure products spanning embedded sensors, hardware, wireless connectivity, mobile applications, cloud platforms, analytics, automated reporting and real-time monitoring across construction and geotechnical domains.
SmartPile® Inspector / Duplex — IoT-enabled pile-driving and integrity monitoring solution using audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring and automated reporting. Owned development; managed product requirements, roadmap, cross-functional delivery, testing and field deployment across hardware, software, cloud and engineering teams.
SmartPile® EDC — Embedded structural sensing solution collecting strain, temperature and load-related data from piles and concrete structures. Coordinated sensor, wireless communication, data acquisition and software integration for real-time structural monitoring and analysis.
SmartWaterMonitor — IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts and remote monitoring. Managed product requirements, integrations, testing and deployment for applications including dams, embankments, seepage and geotechnical monitoring.
SmartFieldSheet / SmartDensity — Mobile field-data collection and reporting solution wirelessly capturing density-gauge data and streamlining QA/QC approvals, report generation and client submission. Led product requirements, workflow digitization, testing and field implementation to replace manual field sheets, data entry and reporting processes.

QUALITY ANALYST — SuAi, Inc. | Hyderabad | April 2019 – October 2019
- Identified process, quality, and delivery gaps through operational analysis, coordinating corrective actions with internal stakeholders.
- Delivered management reporting and performance metrics to support process improvement and standardization.

PROCESS DEVELOPER — Genpact India Private Limited | Hyderabad & Arizona, USA | August 2016 – February 2019
- Managed a 25-member team for client GoDaddy, delivering daily customer operations and handling 200+ customer interactions daily while maintaining quality and service standards.
- HST 550 certified on Hosting Advanced Tech; trained and coached team members on hosting technology terms, products, and processes while maintaining quality standards.
- Monitored KPIs, productivity, and service-level performance, managing escalations and coordinating resolution with internal stakeholders.
- Led process transitions, training, and operational implementation, identifying bottlenecks and driving improvement initiatives.
- Selected for onsite assignment in Arizona, USA, collaborating with US-based teams and stakeholders.

KEY HIGHLIGHTS
- 9+ years of experience across project management, software delivery, QA, and business operations.
- Currently managing 7+ concurrent projects and 9+ client relationships.
- Lead cross-functional delivery teams of 30+ members and coordinate 30+ vendors/partners.
- Delivered a six-module ERP platform from the ground up and a LegalTech platform from concept to launch.
- Strong track record in RAID/risk management, UAT ownership, release management, and post-production support.
- International delivery experience with US-based stakeholders onsite in Florida and Arizona.

METHODOLOGIES & TOOLS
Methodologies: Agile | Scrum | SDLC | UAT | Project Lifecycle Management | Risk Management | Change Management | Release Management | Continuous Improvement
Tools & Platforms: Jira | Microsoft Project Management Systems | Microsoft Excel | PowerPoint | Word | Azure | ERP | CRM | HRMS | ATS

EDUCATION
Bachelor of Technology — Mechanical Engineering, CMR Engineering College | 2012 – 2016
`.trim();

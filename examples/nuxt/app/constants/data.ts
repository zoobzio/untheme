/**
 * Pricing plans shown in the pricing section; `featured` flags the plan that
 * gets the highlighted treatment.
 */
export const TIERS = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    featured: false,
    action: "Start free",
    features: [
      "3 services, 7-day retention",
      "Dashboards and alerting",
      "Community support",
    ],
  },
  {
    name: "Team",
    price: "$29",
    cadence: "per seat / month",
    featured: true,
    action: "Start a trial",
    features: [
      "Unlimited services",
      "13-month retention",
      "SLO tracking and burn alerts",
      "SSO and audit log",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual",
    featured: false,
    action: "Talk to sales",
    features: [
      "Self-hosted or dedicated cloud",
      "Custom retention and residency",
      "24/7 support with an SLA",
    ],
  },
];

/**
 * Customer testimonials; `accent` picks which accent family (primary /
 * secondary / tertiary) colors each card.
 */
export const QUOTES = [
  {
    quote:
      "We deleted four Grafana boards the first week. The on-call channel has never been this quiet.",
    name: "Mara Chen",
    role: "Platform lead, Nimbus",
    initials: "MC",
    accent: "primary",
  },
  {
    quote:
      "Borealis is the first tool where the dashboard my CTO sees is the one my SREs actually use.",
    name: "Diego Álvarez",
    role: "VP Engineering, Vertex",
    initials: "DA",
    accent: "secondary",
  },
  {
    quote:
      "The bill went down. The coverage went up. I keep waiting for the catch.",
    name: "Priya Raman",
    role: "SRE manager, Coldfront",
    initials: "PR",
    accent: "tertiary",
  },
];

/**
 * The aurora field: one blurred orb per entry, cycling the accent families
 * (p/t/s). Fixed literals within the design's thresholds — SSR and
 * hydration must agree, so nothing here is randomized per render.
 */
export const ORBS = [
  {
    family: "p",
    size: "34vw",
    x: "-8vw",
    y: "-12vw",
    travel: "72vh",
    drift: "5vw",
  },
  {
    family: "t",
    size: "22vw",
    x: "68vw",
    y: "-6vw",
    travel: "54vh",
    drift: "7vw",
  },
  {
    family: "s",
    size: "16vw",
    x: "34vw",
    y: "10vh",
    travel: "88vh",
    drift: "4vw",
  },
  {
    family: "p",
    size: "12vw",
    x: "86vw",
    y: "22vh",
    travel: "40vh",
    drift: "8vw",
  },
  {
    family: "t",
    size: "40vw",
    x: "-12vw",
    y: "38vh",
    travel: "96vh",
    drift: "3vw",
  },
  {
    family: "s",
    size: "26vw",
    x: "56vw",
    y: "30vh",
    travel: "62vh",
    drift: "6vw",
  },
  {
    family: "p",
    size: "18vw",
    x: "12vw",
    y: "50vh",
    travel: "78vh",
    drift: "7vw",
  },
  {
    family: "t",
    size: "14vw",
    x: "78vw",
    y: "44vh",
    travel: "48vh",
    drift: "5vw",
  },
  {
    family: "s",
    size: "44vw",
    x: "24vw",
    y: "-16vw",
    travel: "98vh",
    drift: "4vw",
  },
  {
    family: "p",
    size: "24vw",
    x: "44vw",
    y: "58vh",
    travel: "66vh",
    drift: "6vw",
  },
  {
    family: "t",
    size: "30vw",
    x: "-6vw",
    y: "16vh",
    travel: "84vh",
    drift: "8vw",
  },
  {
    family: "s",
    size: "13vw",
    x: "90vw",
    y: "36vh",
    travel: "44vh",
    drift: "3vw",
  },
];

/**
 * Question-and-answer pairs rendered in the FAQ section.
 */
export const FAQS = [
  {
    question: "How long does migration take?",
    answer:
      "Most teams point their OpenTelemetry exporters at Borealis and see data inside an hour. Our importer replays your existing dashboards and alert rules, and the two systems can run side by side for as long as you like.",
  },
  {
    question: "Can we self-host?",
    answer:
      "Yes — the Enterprise tier ships as a single container image with an embedded columnar store, or as a Helm chart if you would rather bring your own. Same UI, same API, your hardware.",
  },
  {
    question: "What exactly is metered?",
    answer:
      "Ingested events, nothing else. Dashboards, alerts, seats on the Starter and Enterprise tiers, and queries are all unmetered — we think you should never be afraid to look at your own data.",
  },
  {
    question: "Where does our data live?",
    answer:
      "Your choice of US, EU, or APAC regions at every tier, with per-dataset residency controls on Enterprise. Data never leaves the region you pick.",
  },
];

/**
 * Relative heights (as percentages) for the decorative bar chart in the demo.
 */
export const BARS = [38, 52, 46, 64, 58, 74, 66, 82, 71, 90, 78, 60];

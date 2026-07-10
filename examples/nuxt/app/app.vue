<script setup lang="ts">
/**
 * Borealis — a fictional observability platform whose landing page is
 * styled entirely by untheme tokens. The page itself is the demo: the demo
 * bar swaps themes and modifier contexts, and every surface below rebrands
 * without a rule of CSS changing.
 */
const tiers = [
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

const quotes = [
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

const faqs = [
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
</script>

<template>
  <div class="page">
    <DemoBar />

    <header class="masthead">
      <p class="brand">borealis</p>
      <nav class="site-nav" aria-label="Site">
        <a href="#product">Product</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
      <button type="button" class="button button-primary">Start free</button>
    </header>

    <main>
      <section id="product" class="hero">
        <div class="hero-atmos" aria-hidden="true">
          <span class="hero-orb hero-orb-a"></span>
          <span class="hero-orb hero-orb-b"></span>
          <span class="hero-grid"></span>
        </div>
        <div class="hero-copy">
          <p class="eyebrow">Observability, minus the noise</p>
          <h1>
            Every signal, in the <span class="hero-accent">right light</span>.
          </h1>
          <p class="lede">
            Borealis turns raw telemetry into dashboards your whole team can
            read — metrics, traces, and logs in one calm view, with alerts that
            only fire when a human should look.
          </p>
          <div class="actions">
            <button type="button" class="button button-primary">
              Start free
            </button>
            <button type="button" class="button button-outline">
              Book a demo
            </button>
          </div>
          <p class="hero-foot">Free for three services · No credit card</p>
        </div>
        <ProductMock />
      </section>

      <section class="logos" aria-label="Customers">
        <p>Trusted by teams at</p>
        <ul>
          <li>Nimbus</li>
          <li>Vertex</li>
          <li>Coldfront</li>
          <li>Meridian</li>
          <li>Substrate</li>
        </ul>
      </section>

      <section class="features">
        <h2>Built for the 3am page</h2>
        <div class="feature-grid">
          <article class="feature">
            <span class="feature-mark" aria-hidden="true">01</span>
            <h3>Dashboards that read like sentences</h3>
            <p>
              Golden signals per service, laid out the same way every time. New
              teammates stop asking which graph matters — it is always the first
              one.
            </p>
          </article>
          <article class="feature">
            <span class="feature-mark" aria-hidden="true">02</span>
            <h3>Alerts with judgment</h3>
            <p>
              Burn-rate SLOs instead of static thresholds. Borealis pages you
              for trajectories, not blips, and attaches the trace that explains
              itself.
            </p>
          </article>
          <article class="feature">
            <span class="feature-mark" aria-hidden="true">03</span>
            <h3>Retention without the bill shock</h3>
            <p>
              Thirteen months of queryable history on a flat, per-event meter.
              Look at last year's incident without filing a budget request
              first.
            </p>
          </article>
        </div>
      </section>

      <section class="stats" aria-label="Numbers">
        <dl>
          <div class="stat">
            <dt>Uptime SLA</dt>
            <dd>99.99%</dd>
          </div>
          <div class="stat">
            <dt>Events every day</dt>
            <dd>4.2B</dd>
          </div>
          <div class="stat">
            <dt>From event to insight</dt>
            <dd>&lt;60s</dd>
          </div>
        </dl>
      </section>

      <section class="quotes" aria-label="Testimonials">
        <h2>Loved on both sides of the pager</h2>
        <div class="quote-grid">
          <figure v-for="entry in quotes" :key="entry.name" class="quote">
            <blockquote>{{ entry.quote }}</blockquote>
            <figcaption>
              <span class="avatar" :class="`avatar-${entry.accent}`">
                {{ entry.initials }}
              </span>
              <span>
                <strong>{{ entry.name }}</strong>
                <small>{{ entry.role }}</small>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="pricing" class="pricing">
        <h2>Pricing that meters one thing</h2>
        <p class="section-lede">
          Seats. Not events, not hosts, not a spreadsheet of line items.
          Retention scales with the plan.
        </p>
        <div class="tier-grid">
          <article
            v-for="tier in tiers"
            :key="tier.name"
            class="tier"
            :class="{ 'tier-featured': tier.featured }"
          >
            <p v-if="tier.featured" class="tier-flag">Popular</p>
            <h3>{{ tier.name }}</h3>
            <p class="tier-price">
              {{ tier.price }} <small>{{ tier.cadence }}</small>
            </p>
            <ul>
              <li v-for="feature in tier.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
            <button
              type="button"
              class="button"
              :class="tier.featured ? 'button-primary' : 'button-outline'"
            >
              {{ tier.action }}
            </button>
          </article>
        </div>
      </section>

      <section id="faq" class="faq">
        <h2>Questions, answered</h2>
        <div class="faq-list">
          <details v-for="entry in faqs" :key="entry.question" class="faq-item">
            <summary>{{ entry.question }}</summary>
            <p>{{ entry.answer }}</p>
          </details>
        </div>
      </section>

      <section class="banner" aria-label="Call to action">
        <div class="banner-inner">
          <h2>See your stack in a better light.</h2>
          <p>Free for three services. No card, no meter anxiety.</p>
          <button type="button" class="button button-inverse">
            Start free
          </button>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-grid">
        <nav aria-label="Product">
          <h3>Product</h3>
          <a href="#product">Dashboards</a>
          <a href="#product">Alerts</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <nav aria-label="Company">
          <h3>Company</h3>
          <a href="#">About</a>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
        </nav>
        <nav aria-label="Resources">
          <h3>Resources</h3>
          <a href="#">Docs</a>
          <a href="#">Status</a>
          <a href="#faq">FAQ</a>
        </nav>
        <nav aria-label="Legal">
          <h3>Legal</h3>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </nav>
      </div>
      <p class="footer-note">
        Borealis is a fictional product. This page is themed by
        <strong>untheme</strong> — every color, size, radius, shadow, and motion
        value on it is a design token.
      </p>
    </footer>
  </div>
</template>

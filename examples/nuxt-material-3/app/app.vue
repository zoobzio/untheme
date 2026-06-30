<script setup lang="ts">
// `useUntheme` is auto-imported by @untheme/nuxt. `themes` is the build-time
// catalog from untheme.config; `apply`/`swap` persist the selection to cookies
// and survive SSR, so reloads keep the chosen theme and selection.
const { config, themes, apply, swap, contexts } = useUntheme();

// Every context the `color` modifier offers, straight from the contract:
// light/dark at each contrast level.
const colorContexts = contexts("color");

// A writable computed over the active color context — reads the selection,
// writes through `swap` (which persists). `value` keeps the context union type,
// so no casts and no manual mapping.
const colorContext = computed({
  get: () => config.input.color,
  set: (value) => swap("color", value),
});

const contextLabel = (context: string) => context.replace(/-/g, " ");

const swatch = (key: string, label: string) => ({ key, label });

// The canonical M3 tonal roles, grouped the way the spec presents them.
const roleGroups = [
  {
    title: "Primary",
    rows: [
      swatch("primary", "Primary"),
      swatch("on-primary", "On Primary"),
      swatch("primary-container", "Primary Container"),
      swatch("on-primary-container", "On Primary Container"),
    ],
  },
  {
    title: "Secondary",
    rows: [
      swatch("secondary", "Secondary"),
      swatch("on-secondary", "On Secondary"),
      swatch("secondary-container", "Secondary Container"),
      swatch("on-secondary-container", "On Secondary Container"),
    ],
  },
  {
    title: "Tertiary",
    rows: [
      swatch("tertiary", "Tertiary"),
      swatch("on-tertiary", "On Tertiary"),
      swatch("tertiary-container", "Tertiary Container"),
      swatch("on-tertiary-container", "On Tertiary Container"),
    ],
  },
  {
    title: "Surfaces",
    rows: [
      swatch("surface-container-lowest", "Lowest"),
      swatch("surface-container-low", "Low"),
      swatch("surface-container", "Container"),
      swatch("surface-container-high", "High"),
      swatch("surface-container-highest", "Highest"),
    ],
  },
];
</script>

<template>
  <div class="app">
    <header class="bar">
      <div class="bar-lead">
        <span class="logo">M3</span>
        <div>
          <h1>Material You</h1>
          <p>
            {{ config.theme.name }} &middot;
            {{ contextLabel(config.input.color) }}
          </p>
        </div>
      </div>
      <div class="bar-actions">
        <div class="segmented">
          <button
            v-for="t in Object.values(themes)"
            :key="t.id"
            class="seg"
            :class="{ active: config.theme.id === t.id }"
            @click="apply(t)"
          >
            {{ t.name }}
          </button>
        </div>
        <select v-model="colorContext" class="select" aria-label="Color context">
          <option v-for="c in colorContexts" :key="c" :value="c">
            {{ contextLabel(c) }}
          </option>
        </select>
      </div>
    </header>

    <main class="content">
      <section class="hero card">
        <span class="chip">Design tokens, live</span>
        <h2>Build once, theme forever.</h2>
        <p>
          Every color below is an M3 system token resolved through untheme. Flip
          the mode or pick another theme — the token contract holds, the values
          swap.
        </p>
        <div class="btn-row">
          <button class="btn filled">Filled</button>
          <button class="btn tonal">Tonal</button>
          <button class="btn outlined">Outlined</button>
          <button class="btn text">Text</button>
        </div>
      </section>

      <section class="cards">
        <article class="card stat">
          <span class="stat-label">Primary container</span>
          <div class="stat-demo primary-demo">
            <span>Aa</span>
            <small>on-primary-container</small>
          </div>
        </article>
        <article class="card stat">
          <span class="stat-label">Secondary container</span>
          <div class="stat-demo secondary-demo">
            <span>Aa</span>
            <small>on-secondary-container</small>
          </div>
        </article>
        <article class="card stat">
          <span class="stat-label">Tertiary container</span>
          <div class="stat-demo tertiary-demo">
            <span>Aa</span>
            <small>on-tertiary-container</small>
          </div>
        </article>
      </section>

      <section
        v-for="group in roleGroups"
        :key="group.title"
        class="card roles"
      >
        <h3>{{ group.title }}</h3>
        <div class="swatches">
          <div
            v-for="row in group.rows"
            :key="row.key"
            class="swatch"
            :style="{ background: `var(--${row.key})` }"
          >
            <span class="swatch-name">{{ row.label }}</span>
            <code>--{{ row.key }}</code>
          </div>
        </div>
      </section>

      <button class="fab">+</button>
    </main>
  </div>
</template>

<style>
:root {
  color-scheme: light dark;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

body {
  background: var(--background);
  color: var(--on-background);
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
}

/* App bar */
.bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  background: var(--surface-container);
  color: var(--on-surface);
  border-bottom: 1px solid var(--outline-variant);
}

.bar-lead {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 1rem;
  background: var(--primary);
  color: var(--on-primary);
  font-weight: 700;
}

.bar h1 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.bar p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  text-transform: capitalize;
}

.bar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.segmented {
  display: flex;
  padding: 0.25rem;
  border-radius: 999px;
  background: var(--surface-container-highest);
  border: 1px solid var(--outline-variant);
}

.seg {
  border: 0;
  background: transparent;
  color: var(--on-surface-variant);
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.seg.active {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.icon-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 1px solid var(--outline-variant);
  background: var(--surface-container-high);
  color: var(--on-surface);
  font-size: 1.1rem;
  cursor: pointer;
}

.select {
  border-radius: 999px;
  border: 1px solid var(--outline-variant);
  background: var(--surface-container-high);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.8rem;
  padding: 0.4rem 0.85rem;
  cursor: pointer;
  text-transform: capitalize;
}

/* Layout */
.content {
  max-width: 980px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
  display: grid;
  gap: 1.5rem;
}

.card {
  background: var(--surface-container-low);
  color: var(--on-surface);
  border-radius: 1.75rem;
  padding: 1.75rem;
  border: 1px solid var(--outline-variant);
}

.hero h2 {
  margin: 0.75rem 0 0.5rem;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.hero p {
  margin: 0 0 1.5rem;
  max-width: 48ch;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.chip {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  background: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

/* Buttons */
.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 1.5rem;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.btn:hover {
  filter: brightness(1.08);
}

.btn.filled {
  background: var(--primary);
  color: var(--on-primary);
}

.btn.tonal {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.btn.outlined {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--outline);
}

.btn.text {
  background: transparent;
  color: var(--primary);
}

/* Stat cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat {
  display: grid;
  gap: 1rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}

.stat-demo {
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: grid;
  gap: 0.4rem;
}

.stat-demo span {
  font-size: 1.6rem;
  font-weight: 700;
}

.stat-demo small {
  font-size: 0.72rem;
  opacity: 0.85;
}

.primary-demo {
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.secondary-demo {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.tertiary-demo {
  background: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

/* Role swatches */
.roles h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.swatch {
  border-radius: 1rem;
  padding: 1rem;
  min-height: 5.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.2rem;
  border: 1px solid var(--outline-variant);
  mix-blend-mode: normal;
}

.swatch-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--on-surface);
  background: var(--surface);
  align-self: flex-start;
  padding: 0.1rem 0.45rem;
  border-radius: 0.4rem;
}

.swatch code {
  font-size: 0.68rem;
  color: var(--on-surface);
  background: var(--surface);
  align-self: flex-start;
  padding: 0.1rem 0.45rem;
  border-radius: 0.4rem;
}

/* FAB */
.fab {
  position: fixed;
  right: 1.75rem;
  bottom: 1.75rem;
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 1.25rem;
  border: 0;
  background: var(--primary-container);
  color: var(--on-primary-container);
  font-size: 1.75rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
</style>

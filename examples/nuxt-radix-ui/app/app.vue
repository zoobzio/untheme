<script setup lang="ts">
// Auto-imported by @untheme/nuxt. `apply` swaps the accent hue; `swap` flips
// the light/dark scale via the `color` modifier. Both persist via cookies
// through SSR.
const { config, themes, apply, swap } = useUntheme();

const toggleMode = () => {
  swap("color", config.input.color === "dark" ? "light" : "dark");
};

// The 12 Radix steps in spec order, mapped to this preset's token names.
const steps = [
  "app-bg",
  "subtle-bg",
  "element",
  "element-hover",
  "element-active",
  "border-subtle",
  "border",
  "border-strong",
  "solid",
  "solid-hover",
  "text-subtle",
  "text",
];

const accentScale = steps.map((s, i) => ({ step: i + 1, key: `accent-${s}` }));
const grayScale = steps.map((s, i) => ({ step: i + 1, key: `gray-${s}` }));
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="brand-dot"></span>
        Radix Scales
      </div>
      <div class="controls">
        <div class="accent-picker">
          <button
            v-for="t in Object.values(themes)"
            :key="t.id"
            class="accent-chip"
            :class="{ active: config.theme.id === t.id }"
            :title="t.name"
            :data-accent="t.id"
            @click="apply(t)"
          >
            {{ t.name }}
          </button>
        </div>
        <button class="mode-btn" @click="toggleMode">
          {{ config.input.color === "dark" ? "Dark" : "Light" }}
        </button>
      </div>
    </header>

    <main class="content">
      <section class="intro">
        <span class="badge"
          >{{ config.theme.name }} · {{ config.input.color }}</span
        >
        <h1>One contract, every hue.</h1>
        <p>
          The twelve-step scale never changes shape — only its values. Pick an
          accent and the whole system re-tints in place: backgrounds, borders,
          solids, and text stay in their semantic steps.
        </p>
      </section>

      <section class="card components">
        <h2>Components</h2>
        <div class="row">
          <button class="rx-btn solid">Solid</button>
          <button class="rx-btn soft">Soft</button>
          <button class="rx-btn outline">Outline</button>
          <button class="rx-btn ghost">Ghost</button>
        </div>
        <div class="row">
          <span class="rx-badge solid">Solid</span>
          <span class="rx-badge soft">Soft</span>
          <span class="rx-badge surface">Surface</span>
          <span class="rx-badge outline">Outline</span>
        </div>
        <div class="row">
          <label class="rx-field">
            <span>Workspace</span>
            <input placeholder="acme-inc" />
          </label>
          <label class="rx-switch">
            <input type="checkbox" checked />
            <span class="track"><span class="thumb"></span></span>
            Notifications
          </label>
        </div>
        <div class="callout">
          <strong>Tip</strong>
          Steps 9–10 are the only ones meant for solid fills with white text;
          everything else stays low-contrast by design.
        </div>
      </section>

      <section class="card">
        <h2>Accent scale</h2>
        <div class="scale">
          <div
            v-for="s in accentScale"
            :key="s.key"
            class="step"
            :style="{ background: `var(--${s.key})` }"
          >
            <span class="step-num">{{ s.step }}</span>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>Gray scale</h2>
        <div class="scale">
          <div
            v-for="s in grayScale"
            :key="s.key"
            class="step"
            :style="{ background: `var(--${s.key})` }"
          >
            <span class="step-num">{{ s.step }}</span>
          </div>
        </div>
      </section>

      <section class="card status-grid">
        <h2>Functional colors</h2>
        <div class="statuses">
          <div class="status error">Error</div>
          <div class="status success">Success</div>
          <div class="status warning">Warning</div>
        </div>
      </section>
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
  background: var(--gray-app-bg);
  color: var(--gray-text);
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

/* Top bar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  background: var(--gray-subtle-bg);
  border-bottom: 1px solid var(--gray-border-subtle);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  color: var(--gray-text);
}

.brand-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--accent-solid);
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-picker {
  display: flex;
  gap: 0.35rem;
}

.accent-chip {
  border: 1px solid var(--gray-border);
  background: var(--gray-element);
  color: var(--gray-text-subtle);
  font: inherit;
  font-size: 0.78rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  cursor: pointer;
}

.accent-chip.active {
  background: var(--accent-solid);
  color: var(--accent-contrast);
  border-color: var(--accent-solid);
}

.mode-btn {
  border: 1px solid var(--gray-border);
  background: var(--gray-element);
  color: var(--gray-text);
  font: inherit;
  font-size: 0.78rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
}

/* Content */
.content {
  max-width: 920px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  display: grid;
  gap: 1.5rem;
}

.intro {
  display: grid;
  gap: 0.75rem;
}

.badge {
  justify-self: start;
  font-size: 0.78rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: var(--accent-subtle-bg);
  color: var(--accent-text);
  border: 1px solid var(--accent-border-subtle);
  text-transform: capitalize;
}

.intro h1 {
  margin: 0;
  font-size: 2.25rem;
  letter-spacing: -0.025em;
  color: var(--gray-text);
}

.intro p {
  margin: 0;
  max-width: 56ch;
  line-height: 1.65;
  color: var(--gray-text-subtle);
}

.card {
  background: var(--gray-subtle-bg);
  border: 1px solid var(--gray-border-subtle);
  border-radius: 1rem;
  padding: 1.5rem;
}

.card h2 {
  margin: 0 0 1.25rem;
  font-size: 1rem;
  color: var(--gray-text);
}

/* Components */
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.rx-btn {
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.55rem 1.1rem;
  border-radius: 0.6rem;
  cursor: pointer;
  border: 1px solid transparent;
}

.rx-btn.solid {
  background: var(--accent-solid);
  color: var(--accent-contrast);
}

.rx-btn.solid:hover {
  background: var(--accent-solid-hover);
}

.rx-btn.soft {
  background: var(--accent-subtle-bg);
  color: var(--accent-text);
}

.rx-btn.soft:hover {
  background: var(--accent-element);
}

.rx-btn.outline {
  background: transparent;
  color: var(--accent-text);
  border-color: var(--accent-border);
}

.rx-btn.ghost {
  background: transparent;
  color: var(--accent-text);
}

.rx-btn.ghost:hover {
  background: var(--accent-subtle-bg);
}

.rx-badge {
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
}

.rx-badge.solid {
  background: var(--accent-solid);
  color: var(--accent-contrast);
}

.rx-badge.soft {
  background: var(--accent-subtle-bg);
  color: var(--accent-text);
}

.rx-badge.surface {
  background: var(--gray-element);
  color: var(--gray-text);
  border: 1px solid var(--gray-border);
}

.rx-badge.outline {
  border: 1px solid var(--accent-border);
  color: var(--accent-text);
}

.rx-field {
  display: grid;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--gray-text-subtle);
}

.rx-field input {
  font: inherit;
  padding: 0.55rem 0.75rem;
  border-radius: 0.55rem;
  border: 1px solid var(--gray-border);
  background: var(--gray-app-bg);
  color: var(--gray-text);
}

.rx-field input:focus {
  outline: 2px solid var(--accent-border-strong);
  outline-offset: -1px;
}

.rx-switch {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.85rem;
  color: var(--gray-text);
  cursor: pointer;
}

.rx-switch input {
  display: none;
}

.rx-switch .track {
  width: 2.4rem;
  height: 1.35rem;
  border-radius: 999px;
  background: var(--gray-element-active);
  padding: 0.15rem;
  transition: background 0.15s ease;
}

.rx-switch .thumb {
  display: block;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  background: var(--gray-contrast);
  transition: transform 0.15s ease;
}

.rx-switch input:checked + .track {
  background: var(--accent-solid);
}

.rx-switch input:checked + .track .thumb {
  transform: translateX(1.05rem);
  background: var(--accent-contrast);
}

.callout {
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.1rem;
  border-radius: 0.75rem;
  background: var(--accent-subtle-bg);
  border: 1px solid var(--accent-border-subtle);
  color: var(--accent-text);
  font-size: 0.85rem;
  line-height: 1.5;
}

.callout strong {
  color: var(--accent-text);
}

/* Scales */
.scale {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 4px;
  border-radius: 0.6rem;
  overflow: hidden;
}

.step {
  aspect-ratio: 1 / 1.4;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.4rem;
}

.step-num {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray-text);
  mix-blend-mode: difference;
  filter: invert(1) grayscale(1) contrast(9);
}

/* Functional colors */
.statuses {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.status {
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid;
}

.status.error {
  background: var(--error-bg);
  color: var(--error-text);
  border-color: var(--error-border);
}

.status.success {
  background: var(--success-bg);
  color: var(--success-text);
  border-color: var(--success-border);
}

.status.warning {
  background: var(--warning-bg);
  color: var(--warning-text);
  border-color: var(--warning-border);
}
</style>

<script setup lang="ts">
import type { Mode } from "untheme";

const { config, themes, apply } = useUntheme();

const setMode = (m: Mode) => {
  config.mode = m;
};

// Resolve the change event's DOM string back to a theme in the catalog.
const onSelectTheme = (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  const selected = Object.values(themes).find((t) => t.id === target.value);
  if (selected) apply(selected);
};

const palette = [
  { key: "primary", on: "on-primary", label: "Primary" },
  { key: "primary-variant", on: "on-primary", label: "Primary Variant" },
  { key: "secondary", on: "on-secondary", label: "Secondary" },
  { key: "secondary-variant", on: "on-secondary", label: "Secondary Variant" },
  { key: "background", on: "on-background", label: "Background" },
  { key: "surface", on: "on-surface", label: "Surface" },
  { key: "error", on: "on-error", label: "Error" },
];
</script>

<template>
  <div class="app">
    <header class="appbar">
      <div class="appbar-lead">
        <span class="menu">≡</span>
        <h1>Material&nbsp;2</h1>
      </div>
      <div class="appbar-actions">
        <select class="select" :value="config.theme.id" @change="onSelectTheme">
          <option v-for="t in Object.values(themes)" :key="t.id" :value="t.id">
            {{ t.name }}
          </option>
        </select>
        <button
          class="appbar-btn"
          @click="setMode(config.mode === 'dark' ? 'light' : 'dark')"
        >
          {{ config.mode === "dark" ? "Dark" : "Light" }}
        </button>
      </div>
    </header>

    <main class="content">
      <section class="card raised hero">
        <h2>{{ config.theme.name }}</h2>
        <p>
          A Material 2 surface system rendered from untheme tokens. Elevation is
          shadow; color is contract. Switch theme or mode and watch the values
          flow through every component.
        </p>
        <div class="actions">
          <button class="btn contained">Contained</button>
          <button class="btn outlined">Outlined</button>
          <button class="btn text">Text</button>
        </div>
      </section>

      <section class="grid">
        <article class="card raised">
          <div class="media"></div>
          <div class="card-body">
            <h3>Elevated card</h3>
            <p>Surface over background, lifted with a soft shadow.</p>
            <div class="chips">
              <span class="chip">Tokens</span>
              <span class="chip">Theming</span>
              <span class="chip">SSR</span>
            </div>
          </div>
        </article>

        <article class="card raised">
          <h3>Form controls</h3>
          <label class="field">
            <span>Email</span>
            <input type="email" placeholder="you@example.com" />
          </label>
          <label class="toggle">
            <input type="checkbox" checked />
            <span>Enable notifications</span>
          </label>
          <button class="btn contained block">Save changes</button>
        </article>

        <article class="card raised banner">
          <strong>Heads up</strong>
          <span>This banner uses the error role for emphasis.</span>
        </article>
      </section>

      <section class="card raised">
        <h3>Color roles</h3>
        <div class="swatches">
          <div
            v-for="p in palette"
            :key="p.key"
            class="swatch"
            :style="{
              background: `var(--${p.key})`,
              color: `var(--${p.on})`,
            }"
          >
            <span>{{ p.label }}</span>
            <code>--{{ p.key }}</code>
          </div>
        </div>
      </section>
    </main>

    <button class="fab">+</button>
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
    "Roboto",
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
}

/* App bar — elevated, primary-filled */
.appbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.25rem;
  height: 4rem;
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.appbar-lead {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu {
  font-size: 1.5rem;
}

.appbar h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.appbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.select {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--primary-variant);
  background: var(--surface);
  color: var(--on-surface);
}

.appbar-btn {
  font: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.45rem 0.9rem;
  border-radius: 4px;
  border: 1px solid var(--on-primary);
  background: transparent;
  color: var(--on-primary);
  cursor: pointer;
}

/* Layout */
.content {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.25rem 5rem;
  display: grid;
  gap: 1.5rem;
}

.card {
  background: var(--surface);
  color: var(--on-surface);
  border-radius: 8px;
  padding: 1.5rem;
}

.raised {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.24),
    0 1px 2px rgba(0, 0, 0, 0.32);
}

.hero h2 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 500;
}

.hero p {
  margin: 0 0 1.5rem;
  max-width: 52ch;
  line-height: 1.6;
  opacity: 0.85;
}

/* Buttons */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  font: inherit;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.55rem 1.25rem;
  border-radius: 4px;
  border: 0;
  cursor: pointer;
}

.btn.contained {
  background: var(--secondary);
  color: var(--on-secondary);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.24),
    0 1px 2px rgba(0, 0, 0, 0.32);
}

.btn.outlined {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary-variant);
}

.btn.text {
  background: transparent;
  color: var(--primary);
}

.btn.block {
  width: 100%;
  margin-top: 0.5rem;
}

/* Grid of cards */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.media {
  height: 7rem;
  margin: -1.5rem -1.5rem 1rem;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.card-body h3,
.card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.card-body p {
  margin: 0 0 1rem;
  opacity: 0.8;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  font-size: 0.78rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: var(--primary-variant);
  color: var(--on-primary);
}

.field {
  display: grid;
  gap: 0.35rem;
  margin: 1rem 0;
  font-size: 0.85rem;
}

.field input {
  font: inherit;
  padding: 0.6rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--primary-variant);
  background: var(--background);
  color: var(--on-background);
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.toggle input {
  accent-color: var(--secondary);
  width: 1.1rem;
  height: 1.1rem;
}

.banner {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: var(--error);
  color: var(--on-error);
}

/* Swatches */
.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.swatch {
  border-radius: 6px;
  padding: 1rem;
  min-height: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 500;
}

.swatch code {
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.85;
}

/* FAB — secondary */
.fab {
  position: fixed;
  right: 1.75rem;
  bottom: 1.75rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 0;
  background: var(--secondary);
  color: var(--on-secondary);
  font-size: 1.75rem;
  cursor: pointer;
  box-shadow:
    0 3px 5px rgba(0, 0, 0, 0.3),
    0 6px 10px rgba(0, 0, 0, 0.22);
}
</style>

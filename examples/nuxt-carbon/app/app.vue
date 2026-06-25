<script setup lang="ts">
import type { Mode } from "untheme";

const { config, themes, apply } = useUntheme();

const rows = [
  { name: "load-balancer-01", status: "Active", region: "us-south", cpu: 42 },
  { name: "db-primary", status: "Active", region: "eu-de", cpu: 78 },
  { name: "worker-pool-a", status: "Degraded", region: "us-east", cpu: 91 },
  { name: "cache-node-3", status: "Active", region: "jp-tok", cpu: 19 },
];

const notifications = [
  {
    kind: "error",
    title: "Deploy failed",
    body: "worker-pool-a exceeded CPU.",
  },
  {
    kind: "success",
    title: "Backup complete",
    body: "db-primary snapshot saved.",
  },
  {
    kind: "info",
    title: "Maintenance",
    body: "Window scheduled for 02:00 UTC.",
  },
];

const supportVar = (kind: string) => `var(--support-${kind})`;

const setMode = (m: Mode) => {
  config.mode = m;
};
</script>

<template>
  <div class="app">
    <header class="shell-header">
      <div class="brand">
        <span class="brand-mark">IBM</span>
        <span class="brand-name">Carbon Console</span>
      </div>
      <nav class="shell-nav">
        <a class="nav-item active">Resources</a>
        <a class="nav-item">Activity</a>
        <a class="nav-item">Settings</a>
      </nav>
      <div class="shell-actions">
        <div class="theme-switch">
          <button
            v-for="theme in Object.values(themes)"
            :key="theme.id"
            class="theme-tab"
            :class="{ active: config.theme.id === theme.id }"
            @click="apply(theme)"
          >
            {{ theme.name }}
          </button>
        </div>
        <button
          class="mode-toggle"
          @click="setMode(config.mode === 'dark' ? 'light' : 'dark')"
        >
          {{ config.mode === "dark" ? "Dark" : "Light" }}
        </button>
      </div>
    </header>

    <main class="content">
      <div class="page-head">
        <div>
          <p class="breadcrumb">Cloud / Compute</p>
          <h1>Resource overview</h1>
        </div>
        <div class="head-actions">
          <button class="btn ghost">Cancel</button>
          <button class="btn secondary">Export</button>
          <button class="btn primary">Provision</button>
        </div>
      </div>

      <section class="notifications">
        <div
          v-for="n in notifications"
          :key="n.title"
          class="notification"
          :style="{ borderInlineStartColor: supportVar(n.kind) }"
        >
          <span class="dot" :style="{ background: supportVar(n.kind) }"></span>
          <div>
            <strong>{{ n.title }}</strong>
            <span>{{ n.body }}</span>
          </div>
        </div>
      </section>

      <section class="tile">
        <div class="tile-head">
          <h2>Instances</h2>
          <span class="tag">{{ rows.length }} active</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Region</th>
              <th>CPU</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.name">
              <td class="mono">{{ row.name }}</td>
              <td>
                <span
                  class="status"
                  :class="row.status === 'Active' ? 'ok' : 'warn'"
                >
                  {{ row.status }}
                </span>
              </td>
              <td>{{ row.region }}</td>
              <td>
                <div class="meter">
                  <span :style="{ width: row.cpu + '%' }"></span>
                </div>
                <small>{{ row.cpu }}%</small>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="panels">
        <div class="tile form-tile">
          <h2>Create resource</h2>
          <label class="field">
            <span>Name</span>
            <input placeholder="my-resource" />
          </label>
          <label class="field">
            <span>Region</span>
            <input placeholder="us-south" />
          </label>
          <p class="helper">Names must be unique within a region.</p>
          <button class="btn primary block">Create</button>
        </div>

        <div class="tile swatch-tile">
          <h2>Token roles</h2>
          <div class="swatches">
            <div
              v-for="t in [
                'background',
                'layer-01',
                'layer-02',
                'field-01',
                'border-subtle-01',
                'border-strong-01',
                'link-primary',
                'text-primary',
              ]"
              :key="t"
              class="swatch"
              :style="{ background: `var(--${t})` }"
            >
              <code>--{{ t }}</code>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

body {
  background: var(--background);
  color: var(--text-primary);
  font-family:
    "IBM Plex Sans",
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
}

/* UI shell header */
.shell-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 3rem;
  padding: 0 1rem;
  background: var(--background);
  border-bottom: 1px solid var(--border-subtle-01);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.brand-mark {
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
}

.brand-name {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.shell-nav {
  display: flex;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  border-block-end: 2px solid transparent;
}

.nav-item.active {
  color: var(--text-primary);
  border-block-end-color: var(--border-interactive);
}

.shell-actions {
  margin-inline-start: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-switch {
  display: flex;
  border: 1px solid var(--border-subtle-01);
}

.theme-tab {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 0.75rem;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.theme-tab.active {
  background: var(--layer-01);
  color: var(--text-primary);
}

.mode-toggle {
  border: 1px solid var(--border-strong-01);
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 0.78rem;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}

/* Content */
.content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: grid;
  gap: 1.25rem;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  justify-content: space-between;
}

.breadcrumb {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  color: var(--text-helper);
}

.page-head h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 400;
}

.head-actions {
  display: flex;
  gap: 1px;
}

/* Buttons — Carbon's hard-edged, full-height productive buttons */
.btn {
  font: inherit;
  font-size: 0.875rem;
  padding: 0.7rem 3rem 0.7rem 0.9rem;
  border: 0;
  cursor: pointer;
  min-width: 7rem;
  text-align: start;
}

.btn.primary {
  background: var(--link-primary);
  color: var(--text-on-color);
}

.btn.secondary {
  background: var(--border-strong-01);
  color: var(--text-on-color);
}

.btn.ghost {
  background: transparent;
  color: var(--link-primary);
  min-width: auto;
  padding-inline-end: 0.9rem;
}

.btn.block {
  width: 100%;
  padding-inline-end: 0.9rem;
}

.btn:hover {
  filter: brightness(1.1);
}

/* Inline notifications */
.notifications {
  display: grid;
  gap: 0.5rem;
}

.notification {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  background: var(--layer-01);
  border-inline-start: 3px solid;
  padding: 0.9rem 1rem;
}

.notification .dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex: none;
}

.notification strong {
  display: block;
  font-size: 0.875rem;
}

.notification span {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Tile / table */
.tile {
  background: var(--layer-01);
  padding: 1.25rem;
}

.tile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.tile h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 400;
}

.tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: var(--layer-02);
  color: var(--text-secondary);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data-table th {
  text-align: start;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
  background: var(--layer-02);
  color: var(--text-secondary);
  border-block-end: 1px solid var(--border-subtle-01);
}

.data-table td {
  padding: 0.75rem;
  border-block-end: 1px solid var(--border-subtle-01);
}

.mono {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}

.status {
  font-size: 0.78rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
}

.status.ok {
  background: color-mix(in srgb, var(--support-success) 22%, transparent);
  color: var(--support-success);
}

.status.warn {
  background: color-mix(in srgb, var(--support-warning) 22%, transparent);
  color: var(--support-warning);
}

.meter {
  display: inline-block;
  width: 5rem;
  height: 6px;
  background: var(--border-subtle-01);
  border-radius: 3px;
  overflow: hidden;
  vertical-align: middle;
  margin-inline-end: 0.5rem;
}

.meter span {
  display: block;
  height: 100%;
  background: var(--link-primary);
}

/* Panels */
.panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.field {
  display: grid;
  gap: 0.3rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.field input {
  font: inherit;
  padding: 0.6rem 0.75rem;
  border: 0;
  border-block-end: 1px solid var(--border-strong-01);
  background: var(--field-01);
  color: var(--text-primary);
}

.field input:focus {
  outline: 2px solid var(--border-interactive);
  outline-offset: -2px;
}

.helper {
  font-size: 0.78rem;
  color: var(--text-helper);
  margin: 0 0 1rem;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.5rem;
}

.swatch {
  min-height: 4.5rem;
  border: 1px solid var(--border-subtle-01);
  display: flex;
  align-items: flex-end;
  padding: 0.5rem;
}

.swatch code {
  font-size: 0.65rem;
  background: var(--background);
  color: var(--text-primary);
  padding: 0.1rem 0.35rem;
}
</style>

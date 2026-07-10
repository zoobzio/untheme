<script setup lang="ts">
/**
 * The product shot: a fake Borealis dashboard window built entirely from
 * tokens — chrome, sidebar, stat cards, a bar chart on the primary ramp,
 * and a service feed carrying the semantic containers. Flip any control and
 * "your app" rebrands with the page.
 */
const bars = [38, 52, 46, 64, 58, 74, 66, 82, 71, 90, 78, 60];
</script>

<template>
  <figure class="mock" aria-label="Borealis dashboard preview">
    <div class="mock-glow" aria-hidden="true" />
    <div class="mock-window">
      <div class="mock-chrome">
        <span class="mock-dot" aria-hidden="true" />
        <span class="mock-dot" aria-hidden="true" />
        <span class="mock-dot" aria-hidden="true" />
        <span class="mock-title">borealis — production</span>
      </div>
      <div class="mock-body">
        <nav class="mock-nav" aria-hidden="true">
          <span class="mock-item mock-item-active">Overview</span>
          <span class="mock-item">Traces</span>
          <span class="mock-item">Logs</span>
          <span class="mock-item">Alerts</span>
        </nav>
        <div class="mock-main">
          <div class="mock-stats">
            <div class="mock-stat">
              <span class="mock-stat-label">Events / min</span>
              <span class="mock-stat-value">48.2k</span>
              <span class="badge badge-success">+12.4%</span>
            </div>
            <div class="mock-stat">
              <span class="mock-stat-label">P99 latency</span>
              <span class="mock-stat-value">312ms</span>
              <span class="badge badge-error">+3.1%</span>
            </div>
            <div class="mock-stat">
              <span class="mock-stat-label">Error rate</span>
              <span class="mock-stat-value">0.02%</span>
              <span class="badge badge-success">−0.4%</span>
            </div>
          </div>
          <div class="mock-chart" aria-hidden="true">
            <span
              v-for="(height, hour) in bars"
              :key="hour"
              class="mock-bar"
              :style="{ blockSize: `${height}%` }"
            />
          </div>
          <ul class="mock-feed">
            <li><span class="pill pill-success">healthy</span> api-gateway</li>
            <li>
              <span class="pill pill-warning">degraded</span> search-index
            </li>
            <li>
              <span class="pill pill-success">healthy</span> billing-worker
            </li>
          </ul>
        </div>
      </div>
    </div>
  </figure>
</template>

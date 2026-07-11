<script setup lang="ts">
const { key, themes, axes, shuffle } = useDemo();
</script>

<template>
  <aside class="demo-bar" aria-label="untheme demo controls">
    <div class="demo-top">
      <p class="demo-note">
        <strong>Borealis is a fiction.</strong> The theming is real — restyle it
        live:
      </p>
      <div class="demo-actions">
        <button
          type="button"
          class="demo-button"
          data-action="shuffle"
          @click="shuffle"
        >
          <span class="demo-button-icon" aria-hidden="true">⇋</span>shuffle
        </button>
      </div>
    </div>
    <div class="demo-axes">
      <fieldset class="axis">
        <legend class="axis-label">theme</legend>
        <select v-model="key" aria-label="Theme">
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.name }}
          </option>
        </select>
      </fieldset>
      <Controls v-for="axis in axes" :key="axis" :axis="axis" />
    </div>
  </aside>
</template>

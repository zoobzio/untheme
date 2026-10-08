<script setup lang="ts">
const { manifest, shuffle } = useDemo();
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
      <Themes />
      <Controls
        v-for="modifier in manifest"
        :key="modifier.id"
        :modifier="modifier"
      />
    </div>
  </aside>
</template>

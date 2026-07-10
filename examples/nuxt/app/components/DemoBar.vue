<script setup lang="ts">
/**
 * The demo chrome: a sticky strip above the landing page carrying the theme
 * picker and one control per modifier axis. The page below stays a plain
 * product page; everything that makes it a demo lives here. Axes, contexts,
 * and the catalog all derive from the untheme instance.
 */
const untheme = useUntheme();

const axes = untheme.modifiers();

const themes = computed(() => Object.values(untheme.themes));

const themeKey = computed({
  get: () => untheme.config.theme.id,
  set: (key) => untheme.select(key),
});
</script>

<template>
  <aside class="demo-bar" aria-label="untheme demo controls">
    <p class="demo-note">
      <strong>Borealis is a fiction.</strong> The theming is real — restyle it
      live:
    </p>
    <div class="demo-controls">
      <label class="demo-theme">
        <span>Theme</span>
        <select v-model="themeKey" aria-label="Theme">
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.name }}
          </option>
        </select>
      </label>
      <AxisControl v-for="axis in axes" :key="axis" :axis="axis" />
    </div>
  </aside>
</template>

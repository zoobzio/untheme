<script setup lang="ts">
import { defineRenderer } from "untheme/css";

/**
 * The demo chrome: a sticky strip above the landing page carrying the theme
 * picker, one control per modifier axis, and the shuffle / copy actions.
 * The page below stays a plain product page; everything that makes it a
 * demo lives here. Axes, contexts, and the catalog all derive from the
 * untheme instance, and the actions act through the same service.
 */
const untheme = useUntheme();

const renderer = defineRenderer(untheme);

const axes = untheme.modifiers();

const themes = computed(() => Object.values(untheme.themes));

/* Theme and axis changes cross-fade where the browser supports it. */
const transition = (change: () => void) => {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(change);
    return;
  }
  change();
};

const themeKey = computed({
  get: () => untheme.config.theme.id,
  set: (key) => transition(() => untheme.select(key)),
});

const pick = <T,>(list: readonly T[]): T => {
  const found = list[Math.floor(Math.random() * list.length)];
  if (found === undefined) {
    throw new Error("cannot pick from an empty list");
  }
  return found;
};

/* A random theme and a random context per axis, applied as one selection —
   validated through the schema, which also narrows it to the contract. */
const shuffle = () => {
  const random: Record<string, string> = {};
  for (const axis of axes) {
    random[axis] = pick(untheme.contexts(axis));
  }
  if (!untheme.schema.check.input(random)) {
    return;
  }
  transition(() => {
    untheme.select(pick(Object.keys(untheme.themes)));
    untheme.config.input = random;
  });
};

const copied = ref(false);

/* The active selection's resolved custom properties, as pasteable CSS. */
const copy = async () => {
  await navigator.clipboard.writeText(renderer.root());
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
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
        <button
          type="button"
          class="demo-button"
          data-action="copy"
          :data-copied="copied || undefined"
          @click="copy"
        >
          <span class="demo-button-icon" aria-hidden="true">⧉</span>
          <span class="demo-button-label">copy CSS</span>
        </button>
      </div>
    </div>
    <div class="demo-axes">
      <label class="demo-theme">
        <span class="demo-cell-label">theme</span>
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

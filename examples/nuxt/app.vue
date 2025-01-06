<script setup lang="ts">
const { theme, mode, tokens } = useUntheme();

const themes = ["emerald", "indigo", "cyan", "rose", "warm", "cold"] as const;
const modes = ["dark", "light"] as const;
const spacing = [
  "spacing-2xs",
  "spacing-xs",
  "spacing-s",
  "spacing-m",
  "spacing-l",
  "spacing-xl",
  "spacing-2xl",
] as const;
const radius = [
  "radius-none",
  "radius-xs",
  "radius-s",
  "radius-m",
  "radius-l",
  "radius-xl",
  "radius-full",
] as const;
</script>

<template>
  <article>
    <h1>Untheme Demo</h1>

    <h2>Themes</h2>
    <div class="flex">
      <Button v-for="t in themes" :key="t" @click="() => (theme = t)">
        {{ t }}
      </Button>
    </div>

    <h2>Modes</h2>
    <div class="flex">
      <Button v-for="m in modes" :key="m" @click="() => (mode = m)">
        {{ m }}
      </Button>
    </div>

    <h2>Settings</h2>
    <h3>Spacing</h3>
    <div class="flex">
      <Button
        v-for="s in spacing"
        :key="s"
        @click="() => (tokens['spacing-default'] = s)"
      >
        {{ s }}
      </Button>
    </div>
    <h3>Radius</h3>
    <div class="flex">
      <Button v-for="r in radius" :key="r">
        {{ r }}
      </Button>
    </div>
  </article>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}

article {
  background-color: var(--ui-surface);
  color: var(--ui-on-surface);

  min-height: 100vh;
  min-width: 100vw;
}

.flex {
  display: flex;
  align-items: center;

  padding: var(--spacing-default);
  gap: var(--spacing-default);
}

h1,
h2,
h3 {
  margin: 0;
  padding: var(--spacing-default);
}
</style>

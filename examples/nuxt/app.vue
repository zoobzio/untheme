<script setup lang="ts">
const { mode, tokens } = useUntheme();

function toggle() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}

function toggleOnPrimary() {
  tokens.value["color-on-primary"] = "color-special";
}

function toggleBelowPrimary() {
  tokens.value["color-below-primary"] = "color-special";
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <article class="prose">
      <h1 @click="toggle">Colors</h1>
      <div class="flex items-center gap-spacing-sm">
        <div
          class="bg-color-on-primary h-50px w-50px rounded-xl"
          @click="toggleOnPrimary"
        />
        <div
          class="bg-color-below-primary h-50px w-50px rounded-xl"
          @click="toggleBelowPrimary"
        />
      </div>
    </article>
  </div>
</template>

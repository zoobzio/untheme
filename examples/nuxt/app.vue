<script setup lang="ts">
const { mode, tokens } = useUntheme();

function toggle() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}

function swap() {
  tokens.value.onPrimary = "yellow";
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <article class="prose">
      <h1 @click="toggle">Colors</h1>
      <div class="flex items-center gap-4">
        <div class="bg-on-primary h-50px w-50px rounded-xl" @click="swap" />
        <div class="bg-below-primary h-50px w-50px rounded-xl" @click="swap" />
      </div>
    </article>
  </div>
</template>

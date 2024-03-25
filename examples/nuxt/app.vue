<script setup lang="ts">
const colorMode = useColorMode();

function toggle() {
  colorMode.preference = colorMode.value === "light" ? "dark" : "light";
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <article class="prose">
      <h1 @click="toggle">Colors</h1>
      <div class="flex items-center gap-4">
        <div class="bg-on-primary h-50px w-50px rounded-xl" />
        <div class="bg-below-primary h-50px w-50px rounded-xl" />
      </div>
    </article>
  </div>
</template>

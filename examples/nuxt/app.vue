<script setup lang="ts">
const colorMode = useColorMode();
function toggle() {
  colorMode.preference = colorMode.value === "light" ? "dark" : "light";
}
</script>

<template>
  <div @click="toggle">
    <NuxtWelcome />
  </div>
</template>

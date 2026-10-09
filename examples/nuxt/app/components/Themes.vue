<script setup lang="ts">
const { entries, active, select } = useThemes();

const selection = computed({
  get: () => active.value,
  set: (id: string) => {
    void select(id);
  },
});
</script>

<template>
  <fieldset class="axis" title="The palette: each theme is a layer of aurora">
    <legend class="axis-label">Theme</legend>
    <select v-model="selection" name="theme">
      <option v-for="entry in entries" :key="entry.id" :value="entry.id">
        {{ entry.name }}
      </option>
    </select>
  </fieldset>
</template>

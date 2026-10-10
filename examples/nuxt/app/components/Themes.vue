<script setup lang="ts">
const untheme = useUntheme();
const { transition } = useDemo();

const selection = computed({
  get: () => untheme.theme().id,
  set: (id: string) => {
    void transition(async () => {
      await untheme.select(id);
    });
  },
});
</script>

<template>
  <fieldset
    class="axis"
    title="The palette: the base of the preset, or one of its layers"
  >
    <legend class="axis-label">Theme</legend>
    <select v-model="selection" name="theme">
      <option v-for="entry in untheme.layers" :key="entry.id" :value="entry.id">
        {{ entry.name }}
      </option>
    </select>
  </fieldset>
</template>

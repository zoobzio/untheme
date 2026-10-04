<script setup lang="ts">
import type { ModifierEntry } from "#build/untheme/manifest.mjs";

const { modifier } = defineProps<{ modifier: ModifierEntry }>();
const { selection } = useControls(modifier.id);
</script>

<template>
  <fieldset class="axis" :title="modifier.description">
    <legend class="axis-label">{{ modifier.name }}</legend>
    <select v-model="selection" :name="modifier.id">
      <option
        v-for="context in modifier.contexts"
        :key="context.id"
        :value="context.id"
        :title="context.description"
      >
        {{ context.name }}
      </option>
    </select>
  </fieldset>
</template>

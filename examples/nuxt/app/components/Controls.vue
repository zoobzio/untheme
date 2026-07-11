<script setup lang="ts" generic="A extends keyof AppInput & string">
const { axis } = defineProps<{ axis: A }>();
const { options, selection } = useControls(axis);
</script>

<template>
  <fieldset class="axis">
    <legend class="axis-label">{{ axis }}</legend>
    <select v-model="selection" :name="axis">
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </fieldset>
</template>

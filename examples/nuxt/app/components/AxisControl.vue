<script setup lang="ts" generic="A extends keyof AppInput & string">
/**
 * One modifier axis as a radio fieldset. The options come from the contract
 * (`contexts`), the selection reads from the live input, and writes go
 * through `swap`, which persists the selection to its cookie.
 */
const props = defineProps<{ axis: A }>();

const untheme = useUntheme();

const options = untheme.contexts(props.axis);

const selection = computed({
  get: () => untheme.config.input[props.axis],
  set: (context) => untheme.swap(props.axis, context),
});

const label = (value: string) => value.replace(/[-_]/g, " ");
</script>

<template>
  <fieldset class="axis">
    <legend>{{ label(axis) }}</legend>
    <label v-for="option in options" :key="option" class="axis-option">
      <input v-model="selection" type="radio" :name="axis" :value="option" />
      <span>{{ label(option) }}</span>
    </label>
  </fieldset>
</template>

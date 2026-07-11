<script setup lang="ts" generic="A extends keyof AppInput & string">
/**
 * One modifier axis as a labeled select. The options come from the contract
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

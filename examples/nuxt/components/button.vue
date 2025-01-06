<template>
  <button>
    <slot />
  </button>
</template>

<style scoped>
button {
  background-color: var(--ui-primary);
  color: var(--ui-on-primary);

  padding: var(--spacing-default);

  border: 1px solid var(--ui-outline);
  border-radius: var(--radius-default);

  appearance: none;
  outline: none;

  font-weight: bold;
}

button:hover {
  background-color: var(--ui-primary-tonal);
  color: var(--ui-on-primary-tonal);
  cursor: pointer;
}
</style>

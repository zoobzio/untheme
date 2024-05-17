<script setup lang="ts">
const { theme, mode } = useUntheme();
const themes = useThemes();
const modes = ["dark", "light"] as const;
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-clr-surface text-clr-content"
  >
    <article class="prose flex flex-col gap-spacing-default">
      <h1>Basic Untheme Example</h1>
      <table class="table-fixed">
        <thead>
          <tr>
            <th>Primary</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="bg-clr-primary w-200px pa-spacing-default" />
            <td class="bg-clr-error w-200px pa-spacing-default" />
          </tr>
        </tbody>
      </table>
      <div class="flex items-center gap-spacing-default">
        <label for="theme">Theme</label>
        <select v-model="theme" name="theme">
          <option v-for="t in themes" :key="t" :value="t">
            {{ t }}
          </option>
        </select>
        <label for="mode">Mode</label>
        <select v-model="mode" name="mode">
          <option v-for="m in modes" :key="m" :value="m">
            {{ m }}
          </option>
        </select>
      </div>
    </article>
  </div>
</template>

<style scoped>
select {
  --apply: "bg-clr-primary pa-spacing-default rounded";
}
</style>

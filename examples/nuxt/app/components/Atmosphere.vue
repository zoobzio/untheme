<template>
  <div class="page-atmos" aria-hidden="true">
    <span
      v-for="(orb, at) in ORBS"
      :key="at"
      class="page-orb"
      :class="`page-orb-${orb.family}`"
      :style="{
        '--orb-size': orb.size,
        '--orb-x': orb.x,
        '--orb-y': orb.y,
        '--orb-travel': orb.travel,
        '--orb-drift': orb.drift,
      }"
    ></span>
    <span class="page-grid"></span>
  </div>
</template>

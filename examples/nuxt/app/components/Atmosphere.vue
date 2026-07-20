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
    <div class="aurora">
      <span
        v-for="(band, at) in BANDS"
        :key="at"
        class="aurora-band"
        :class="`aurora-band-${band.family}`"
        :style="{
          '--band-x': band.x,
          '--band-w': band.w,
          '--band-skew': band.skew,
          '--band-delay': band.delay,
          '--band-dur': band.dur,
          '--band-h': band.h,
        }"
      ></span>
    </div>
    <span class="page-grid"></span>
  </div>
</template>

<script setup lang="ts">
/**
 * The aurora showcase: a landing page whose every color, size, radius,
 * shadow, and motion value is an untheme token, with live controls for the
 * theme catalog and all six modifier axes. Nothing on this page is
 * hardcoded — the axes, their contexts, the theme list, and the ramp
 * swatches all derive from the untheme instance.
 */
const untheme = useUntheme();

const axes = untheme.modifiers();

const themes = computed(() => Object.values(untheme.themes));

const themeKey = computed({
  get: () => untheme.config.theme.id,
  set: (key) => untheme.select(key),
});

/* The primary ramp's stops, in ascending order, straight off the flat token
   map. */
const rampStops = computed(() => {
  return Object.keys(untheme.tokens())
    .filter((token) => /^primary-\d+$/.test(token))
    .sort((a, b) => Number(a.slice(8)) - Number(b.slice(8)));
});
</script>

<template>
  <div class="page">
    <header class="masthead">
      <p class="brand">aurora</p>
      <p class="tagline">the untheme reference preset</p>
    </header>

    <aside class="controls" aria-label="Theme and modifier controls">
      <div class="control-theme">
        <label for="theme-picker">Theme</label>
        <select id="theme-picker" v-model="themeKey">
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.name }}
          </option>
        </select>
      </div>
      <AxisControl v-for="axis in axes" :key="axis" :axis="axis" />
    </aside>

    <main>
      <section class="hero">
        <h1>Build once, theme forever.</h1>
        <p>
          Every value on this page is a design token resolved through untheme.
          Pick a theme, flip an axis — the contract holds, the values swap, and
          the CSS never changes.
        </p>
        <div class="actions">
          <button type="button" class="button button-primary">
            Get started
          </button>
          <button type="button" class="button button-outline">
            Read the docs
          </button>
        </div>
      </section>

      <section class="features" aria-label="Feature cards">
        <h2>Composable by construction</h2>
        <div class="feature-grid">
          <article class="feature">
            <h3>One contract</h3>
            <p>
              Tokens declare their type and their relationships; themes only
              rebind values. A layer that steps outside the contract fails
              validation before it ever renders.
            </p>
          </article>
          <article class="feature">
            <h3>Six axes</h3>
            <p>
              Color, contrast, text, density, radius, and motion compose in a
              declared order. Contexts override disjoint token sets, so every
              combination stays coherent.
            </p>
          </article>
          <article class="feature">
            <h3>References all the way down</h3>
            <p>
              Roles point at ramp stops, composites point at scalars, and the
              renderer keeps every reference as a var() indirection — one rebind
              cascades everywhere.
            </p>
          </article>
        </div>
      </section>

      <section class="specimen" aria-label="Type specimen">
        <h2>Type specimen</h2>
        <p class="type-display">Display</p>
        <p class="type-headline">Headline</p>
        <p class="type-title">Title</p>
        <p class="type-body">
          Body — the reading size. The text axis rebinds the size scalars and
          the typography composites follow through sub-value references.
        </p>
        <p class="type-label">Label — for controls and captions</p>
      </section>

      <section class="callouts" aria-label="Semantic callouts">
        <h2>Semantic roles</h2>
        <aside class="callout callout-success">
          <strong>Success</strong>
          <p>The build is green. Every theme keeps this recognizably green.</p>
        </aside>
        <aside class="callout callout-warning">
          <strong>Warning</strong>
          <p>Contrast at default. Try the high context on the contrast axis.</p>
        </aside>
        <aside class="callout callout-error">
          <strong>Error</strong>
          <p>Reserved for actual problems — of which this page has none.</p>
        </aside>
      </section>

      <section class="ramp" aria-label="Primary ramp">
        <h2>The primary ramp</h2>
        <ol class="stops">
          <li
            v-for="stop in rampStops"
            :key="stop"
            class="stop"
            :style="{ background: `var(--${stop})` }"
          >
            <code>{{ stop }}</code>
          </li>
        </ol>
      </section>
    </main>

    <footer class="footer">
      <p>
        {{ untheme.config.theme.name }} — rendered from
        {{ Object.keys(untheme.tokens()).length }} tokens.
      </p>
    </footer>
  </div>
</template>

<template>
  <section class="quotes" aria-label="Testimonials">
    <h2>Loved on both sides of the pager</h2>
    <div class="quote-grid">
      <figure v-for="entry in QUOTES" :key="entry.name" class="quote">
        <blockquote>{{ entry.quote }}</blockquote>
        <figcaption>
          <span class="avatar" :class="`avatar-${entry.accent}`">
            {{ entry.initials }}
          </span>
          <span>
            <strong>{{ entry.name }}</strong>
            <small>{{ entry.role }}</small>
          </span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<template>
  <section id="pricing" class="pricing">
    <h2>Pricing that meters one thing</h2>
    <p class="section-lede">
      Seats. Not events, not hosts, not a spreadsheet of line items. Retention
      scales with the plan.
    </p>
    <div class="tier-grid">
      <article
        v-for="tier in TIERS"
        :key="tier.name"
        class="tier"
        :class="{ 'tier-featured': tier.featured }"
      >
        <p v-if="tier.featured" class="tier-flag">Popular</p>
        <h3>{{ tier.name }}</h3>
        <p class="tier-price">
          {{ tier.price }} <small>{{ tier.cadence }}</small>
        </p>
        <ul>
          <li v-for="feature in tier.features" :key="feature">
            {{ feature }}
          </li>
        </ul>
        <button
          type="button"
          class="button"
          :class="tier.featured ? 'button-primary' : 'button-outline'"
        >
          {{ tier.action }}
        </button>
      </article>
    </div>
  </section>
</template>

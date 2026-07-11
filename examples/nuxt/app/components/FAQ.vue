<template>
  <section id="faq" class="faq">
    <h2>Questions, answered</h2>
    <div class="faq-list">
      <details v-for="entry in FAQS" :key="entry.question" class="faq-item">
        <summary>{{ entry.question }}</summary>
        <p>{{ entry.answer }}</p>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
const title = "Tokenize Your Design System";
const description =
  "Untheme lets you define atomic style tokens that are implemented as CSS variables. Fully responsive & fully typed.";
const links = [
  {
    label: "Get Started",
    icon: "i-heroicons-rocket-launch",
    size: "lg",
    to: "/getting-started/introduction",
  },
];
const features = [
  {
    icon: "i-heroicons-eye-dropper-solid",
    title: "Custom CSS Variables",
    description:
      "Tokens represent atomic style definitions and are implemented as custom CSS variables that can be leverage by any frontend.",
  },
  {
    icon: "i-heroicons-viewfinder-circle-solid",
    title: "Infinitely Extendable Themes",
    description:
      "Define themes that control any style definition in your application that can be modified at runtime.",
  },
  {
    icon: "i-heroicons-swatch-solid",
    title: "Dynamic Color Palettes",
    description:
      "Color plugins allow you to define any conceivable color palette for use across your application.",
  },
  {
    icon: "i-heroicons-globe-americas-solid",
    title: "Universal Style Definitions",
    description:
      "CSS variables can be leveraged in any framework & a growing list of integrations is already available!",
  },
  {
    icon: "i-heroicons-beaker-solid",
    title: "Intuitive Utility Functions",
    description:
      "Leverage first-class integrations w/ CSS engines like UnoCSS to implement utility classes that reflect your style tokens.",
  },
  {
    icon: "i-heroicons-key-solid",
    title: "Fully type-safe",
    description:
      "Every token you define will be fully typed to allow for simple configuration & modification.",
  },
];
</script>

<template>
  <UPage>
    <UPageBody>
      <ULandingHero :title="title" :description="description" :links="links" />
      <UContainer>
        <ULandingGrid>
          <ULandingCard
            v-for="f in features"
            class="col-span-4"
            :icon="f.icon"
            :title="f.title"
            :description="f.description"
          />
        </ULandingGrid>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

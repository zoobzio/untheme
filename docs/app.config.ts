export default defineAppConfig({
  ui: {
    primary: "emerald",
    gray: "stone",
    footer: {
      bottom: {
        left: "text-sm text-gray-500 dark:text-gray-400",
        wrapper: "border-t border-gray-200 dark:border-gray-800",
      },
    },
  },
  seo: {
    siteName: "Untheme - Docs",
  },
  header: {
    logo: {
      alt: "",
      light: "",
      dark: "",
    },
    search: true,
    colorMode: true,
    links: [
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/zoobzio/untheme",
        target: "_blank",
        "aria-label": "Untheme",
      },
    ],
  },
  footer: {
    credits: "MIT 2024 © Alex Thorwaldson",
    colorMode: false,
    links: [
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/zoobzio/untheme",
        target: "_blank",
        "aria-label": "Nuxt UI on GitHub",
      },
    ],
  },
  /*
  toc: {
    title: "Table of Contents",
    bottom: {
      title: "Community",
      edit: "https://github.com/nuxt-ui-pro/docs/edit/main/content",
      links: [
        {
          icon: "i-heroicons-star",
          label: "Star on GitHub",
          to: "https://github.com/nuxt/ui",
          target: "_blank",
        },
        {
          icon: "i-heroicons-book-open",
          label: "Nuxt UI Pro docs",
          to: "https://ui.nuxt.com/pro/guide",
          target: "_blank",
        },
      ],
    },
  },
  */
});

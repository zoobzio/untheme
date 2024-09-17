import { defineNuxtPlugin, useUnthemeRoot, useHead } from "#imports";
export default defineNuxtPlugin(() => {
    const root = useUnthemeRoot();
    useHead({
        style: [
            {
                innerHTML: () => root.value,
            },
        ],
    });
});

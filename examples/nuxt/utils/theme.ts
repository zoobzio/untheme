import { ref, computed } from "vue";
import untheme from "../untheme.config";

const mode = ref<"light" | "dark">("dark");

const theme = computed(() => untheme(mode.value));

const tokens = computed(() => reactive(theme.value.useTokens()));

export function useUntheme() {
    return {
        mode,
        theme,
        tokens
    }
}
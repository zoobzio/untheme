import { ref, computed, reactive } from "vue";
import untheme from "../untheme.config";

const themes = untheme.themes();

const mode = ref<(typeof themes)[number]>(themes[0]);

const tokens = computed(() => reactive(untheme.use(mode.value)));

export function useUntheme() {
  return {
    mode,
    themes,
    tokens,
  };
}

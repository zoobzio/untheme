import { ref, computed } from "vue";
import untheme from "../untheme.config";

const mode = ref<"light" | "dark">("dark");

const tokens = computed(() => reactive(untheme(mode.value)));

export function useUntheme() {
  return {
    mode,
    tokens,
  };
}

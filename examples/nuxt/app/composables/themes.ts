import type { Entry } from "untheme/catalog";

import { defineClient } from "untheme/catalog";
import { layers } from "@untheme/aurora/layers";

/**
 * Binds the theme picker. The themes are the layers of aurora. The server
 * route under `/api/untheme` serves them. `entries` starts with the layers
 * manifest of aurora. `refresh` replaces it with the first page of the
 * catalog. `active` is the id of the applied theme. `select` gets one layer
 * from the catalog and applies it in a view transition.
 */
export const useThemes = () => {
  const untheme = useUntheme();
  const { transition } = useDemo();

  const catalog = defineClient(untheme.schema, { base: "/api/untheme" });

  const entries = ref<Entry[]>(layers.map(({ id, name }) => ({ id, name })));

  const active = computed(() => untheme.theme().id);

  const refresh = async () => {
    const page = await catalog.list({ limit: 100 });
    entries.value = page.entries;
  };

  const select = async (id: string) => {
    const layer = await catalog.get(id);
    if (layer === undefined) {
      return;
    }
    transition(() => untheme.apply(layer));
  };

  return { entries, active, refresh, select };
};

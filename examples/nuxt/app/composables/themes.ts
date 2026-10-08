import type { Entry } from "untheme/catalog";

import { defineClient } from "untheme/catalog";
import { layers } from "@untheme/aurora/layers";

/**
 * Binds the theme picker. The themes are the layers of aurora. The server
 * route under `/api/untheme` serves them with the catalog wire protocol.
 *
 * `entries` lists the themes. It starts with the layers manifest of aurora,
 * so the server renders the full list. `refresh` replaces it with the first
 * page of the catalog, which exercises the `list` route. `active` is the id of
 * the applied theme. `select` fetches one layer through the catalog and
 * applies it inside a view transition.
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

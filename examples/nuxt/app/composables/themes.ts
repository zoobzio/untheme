import type { Entry } from "untheme/catalog";

import { layers } from "#build/untheme/layers.mjs";

/**
 * Binds the theme picker. The themes are the layers of aurora, which the
 * module serves as the catalog. `entries` starts with the layers module of the
 * build. `refresh` replaces it with the first page of the catalog. `active` is
 * the id of the applied theme. `select` gets one layer from the catalog and
 * applies it in a view transition.
 */
export const useThemes = () => {
  const untheme = useUntheme();
  const catalog = useUnthemeCatalog();
  const { transition } = useDemo();

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

import type { Entry } from "untheme/catalog";

import { layers } from "#build/untheme/layers.mjs";

/**
 * Binds the theme picker. The themes are the layers of aurora. `entries` lists
 * them from the layers module. `active` is the id of the applied theme.
 * `select` loads one layer through the catalog and applies it in a view
 * transition.
 */
export const useThemes = () => {
  const untheme = useUntheme();
  const catalog = useUnthemeCatalog();
  const { transition } = useDemo();

  const entries: Entry[] = layers.map(({ id, name }) => ({ id, name }));

  const active = computed(() => untheme.theme().id);

  const select = async (id: string) => {
    const layer = await catalog.get(id);
    if (layer === undefined) {
      return;
    }
    transition(() => untheme.apply(layer));
  };

  return { entries, active, select };
};

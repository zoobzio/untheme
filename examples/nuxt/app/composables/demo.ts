import type { Entry } from "untheme/catalog";

/**
 * State and actions for the interactive demo: the modifier axes, the theme
 * manifest listed from the served catalog, a `key` binding for the active
 * theme, and `shuffle` to randomize the whole selection. Applying a theme
 * retrieves its layer from the catalog on demand; theme and axis changes
 * run through a view-transition cross-fade where the browser supports it.
 */
export const useDemo = async () => {
  const untheme = useUntheme();
  const catalog = useCatalog();

  const axes = untheme.modifiers();

  /* The whole manifest: the first page reports the total, which sizes the
   follow-up listing when more themes match than one page carries. */
  const { data } = await useAsyncData("untheme:catalog", async () => {
    const first = await catalog.list();
    if (first.entries.length >= first.total) {
      return first.entries;
    }
    const whole = await catalog.list({ limit: first.total });
    return whole.entries;
  });

  const themes = computed<Entry[]>(() => data.value ?? []);

  /* Theme and axis changes cross-fade where the browser supports it. */
  const transition = (change: () => void) => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(change);
      return;
    }
    change();
  };

  /* Applying a theme retrieves its layer from the catalog; a miss leaves
   the active theme standing. */
  const choose = async (id: string) => {
    const layer = await catalog.get(id);
    if (!layer) {
      return;
    }
    transition(() => untheme.apply(layer));
  };

  const key = computed({
    get: () => untheme.config.theme.id,
    set: (id) => {
      void choose(id);
    },
  });

  const pick = <T>(list: readonly T[]): T => {
    const found = list[Math.floor(Math.random() * list.length)];
    if (found === undefined) {
      throw new Error("cannot pick from an empty list");
    }
    return found;
  };

  /* A random theme and a random context per axis, applied as one selection —
   validated through the schema, which also narrows it to the contract. */
  const shuffle = async () => {
    if (themes.value.length === 0) {
      return;
    }
    const random: Record<string, string> = {};
    for (const axis of axes) {
      random[axis] = pick(untheme.contexts(axis));
    }
    if (!untheme.schema.check.input(random)) {
      return;
    }
    const layer = await catalog.get(pick(themes.value).id);
    if (!layer) {
      return;
    }
    transition(() => {
      untheme.apply(layer);
      untheme.config.input = random;
    });
  };

  return {
    axes,
    themes,
    key,
    transition,
    pick,
    shuffle,
  };
};

/**
 * State and actions for the interactive demo: the modifier axes, the list of
 * themes, a `key` binding for the active theme, and `shuffle` to randomize the
 * whole selection. Theme and axis changes run through a view-transition
 * cross-fade where the browser supports it.
 */
export const useDemo = () => {
  const untheme = useUntheme();

  const axes = untheme.modifiers();
  const themes = computed(() => Object.values(untheme.themes));

  /* Theme and axis changes cross-fade where the browser supports it. */
  const transition = (change: () => void) => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(change);
      return;
    }
    change();
  };

  const key = computed({
    get: () => untheme.config.theme.id,
    set: (key) => transition(() => untheme.select(key)),
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
  const shuffle = () => {
    const random: Record<string, string> = {};
    for (const axis of axes) {
      random[axis] = pick(untheme.contexts(axis));
    }
    if (!untheme.schema.check.input(random)) {
      return;
    }
    transition(() => {
      untheme.select(pick(Object.keys(untheme.themes)));
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

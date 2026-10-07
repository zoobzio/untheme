import { manifest } from "#build/untheme/manifest.mjs";

/**
 * Returns the state and actions for the interactive demo. `manifest` lists the
 * modifier axes, including the theme, each with its named contexts. `shuffle`
 * selects a random context for each axis. A selection change runs as a
 * view-transition cross-fade where the browser supports it.
 */
export const useDemo = () => {
  const untheme = useUntheme();

  const axes = untheme.modifiers();

  const transition = (change: () => void) => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(change);
      return;
    }
    change();
  };

  const pick = <T>(list: readonly T[]): T => {
    const found = list[Math.floor(Math.random() * list.length)];
    if (found === undefined) {
      throw new Error("cannot pick from an empty list");
    }
    return found;
  };

  /* Picks a random context for each axis and applies the result as one
   selection. The schema validates the selection. */
  const shuffle = () => {
    const random: Record<string, string> = {};
    for (const axis of axes) {
      random[axis] = pick(untheme.contexts(axis));
    }
    if (!untheme.schema.check.input(random)) {
      return;
    }
    transition(() => {
      untheme.config.input = random;
    });
  };

  return {
    axes,
    manifest,
    transition,
    pick,
    shuffle,
  };
};

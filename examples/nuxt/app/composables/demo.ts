import { manifest } from "#build/untheme/manifest.mjs";

/**
 * State and actions for the interactive demo: the manifest of modifier axes —
 * the theme among them, each with its named contexts — and `shuffle` to
 * randomize the whole selection. Selection
 * changes run through a view-transition cross-fade where the browser
 * supports it.
 */
export const useDemo = () => {
  const untheme = useUntheme();

  const axes = untheme.modifiers();

  /* Selection changes cross-fade where the browser supports it. */
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

  /* A random context per axis, applied as one selection — validated through
   the schema, which also narrows it to the contract. */
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

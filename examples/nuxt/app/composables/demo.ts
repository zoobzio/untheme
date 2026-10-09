import { manifest } from "#build/untheme/manifest.mjs";

/**
 * Returns the state and actions for the interactive demo. `manifest` lists the
 * modifier axes, each with its named contexts. `shuffle` selects a random
 * context for each axis and a random theme. A change runs as a
 * view-transition cross-fade where the browser supports it, and the fade
 * waits for an async change.
 */
export const useDemo = () => {
  const untheme = useUntheme();

  const axes = untheme.modifiers();

  const transition = async (change: () => void | Promise<void>) => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      await document.startViewTransition(change).updateCallbackDone;
      return;
    }
    await change();
  };

  const pick = <T>(list: readonly T[]): T => {
    const found = list[Math.floor(Math.random() * list.length)];
    if (found === undefined) {
      throw new Error("cannot pick from an empty list");
    }
    return found;
  };

  /* Picks a random context for each axis and a random theme, and applies
   both in one change. The schema validates the selection. */
  const shuffle = async () => {
    const random: Record<string, string> = {};
    for (const axis of axes) {
      random[axis] = pick(untheme.contexts(axis));
    }
    if (!untheme.schema.check.input(random)) {
      return;
    }
    const theme = untheme.layers.length > 0 ? pick(untheme.layers).id : null;
    await transition(async () => {
      untheme.config.input = random;
      if (theme !== null) {
        await untheme.select(theme);
      }
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

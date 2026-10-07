/**
 * Binds one modifier axis for two-way use. `options` is the list of contexts
 * that the schema allows for the axis. `selection` reads the current context
 * of the axis. Setting `selection` swaps the app to the chosen context.
 */
export const useControls = <A extends keyof AppUnthemeInput & string>(
  axis: A,
) => {
  const untheme = useUntheme();

  const options = untheme.contexts(axis);

  const selection = computed({
    get: () => untheme.config.input[axis],
    set: (context) => untheme.swap(axis, context),
  });

  return { options, selection };
};

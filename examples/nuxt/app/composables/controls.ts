/**
 * Two-way binding for a single modifier axis. `options` is the list of
 * contexts the schema allows for that axis; `selection` reads the axis's
 * current context and, when set, swaps the app to the chosen one.
 */
export const useControls = <A extends keyof AppInput & string>(axis: A) => {
  const untheme = useUntheme();

  const options = untheme.contexts(axis);

  const selection = computed({
    get: () => untheme.config.input[axis],
    set: (context) => untheme.swap(axis, context),
  });

  return { options, selection };
};

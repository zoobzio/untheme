# untheme/plugins

An `untheme` plugin is simply a function that returns a literally-typed key/value record in the expected token format (`kebab-case`). The record literals are ingested by `untheme` & made available in a user token configuration.

A plugin might also expose additional functions to perform actions like creating an alias for a specific set of tokens.

## Build a plugin

There are some utilities available to help build type-safe `untheme` plugins:

| Function                                | Description                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `useUnthemePluginTokens(prefix, pack)`  | Define a set of tokens w/ a common string prefix.                                                     |
| `defineUnthemePluginPack(prefix, pack)` | Define a function that creates a type-safe token definition w/ the option to override default values. |

Functions can be imported from `"untheme/plugins"`.

## Build a color plugin

A color plugin implements a standard set of [material color codes](https://m2.material.io/design/color/the-color-system.html#color-usage-and-palettes) for a given color scheme. Custom color plugins can be created w/ the help of some utilities:

| Function                               | Description                                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineUnthemeColorPack(prefix, pack)` | Define a set of functions that contains a color scheme of colors w/ hex values for 50-950 & allows the user to extract tokens & define aliases. |

## Available plugins

To kickstart your design system, take a look at the available plugins:

### Tailwind

| Plugin                    | Description                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `useTailwindColorPack`    | Define tokens from the [tailwind color scheme](https://tailwindcss.com/docs/customizing-colors). |
| `useTailwindSpacingPack`  | Define tokens for CSS styles like `padding`, `gap`, or `space` using tailwind defaults.          |
| `useTailwindShapePack`    | Define tokens for CSS styles like `border-radius` using tailwind defaults.                       |
| `useTailwindTypesizePack` | Define tokens for CSS styles like `font-size` using tailwind defaults.                           |

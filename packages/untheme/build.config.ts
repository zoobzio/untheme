import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@untheme/colors',
    '@untheme/core',
    '@untheme/kit',
    '@untheme/schema',
    'defu',
    'lodash.kebabcase'
  ],
});
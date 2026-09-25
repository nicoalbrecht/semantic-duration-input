# Nuxt

Add the module. It:

- auto-imports `<DurationInput>`, `useDurationInput`, `parseDuration` and `formatDuration`,
- applies the defaults from `nuxt.config`,
- adds the prebuilt stylesheet.

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'semantic-duration-input/nuxt'],
  durationInput: {
    as: 'UInput', // any component name from #components
    invalidProps: 'nuxtUi', // 'nuxtUi' | 'vuetify' | 'primevue'
    validateOn: 'blur',
  },
})
```

## Options

The options are the [app-wide defaults](./integrations#app-wide-defaults), in a form that can be serialized into the generated plugin:

| Option | |
| --- | --- |
| `as` | A component name resolved from `#components`, e.g. `'UInput'`. It must be a valid identifier, or the build fails |
| `invalidProps` | A preset name: `'nuxtUi'`, `'vuetify'` or `'primevue'` |
| `valueFormat` | `'minutes'`, `'seconds'`, `'ms'` or `'iso'`. Custom conversions can't be serialized, so pass them as a prop instead |
| `formatPreview` | Not available: functions can't be serialized, so pass it as a prop instead |
| `css` | Adds `semantic-duration-input/style.css`. Defaults to `true`, or `false` when `as` is set. `true` forces it |
| Everything else | As on the component: `locales`, `validateOn`, `presets`, `ui`, ... |

Locales are plain data, so they serialize fine. Import them from the core entry in `nuxt.config`:

```ts
import { de, en } from 'semantic-duration-input/core'

export default defineNuxtConfig({
  modules: ['semantic-duration-input/nuxt'],
  durationInput: { locales: [de, en] },
})
```

`preview` and the presets menu only work with the built-in field (see [`as` mode](./integrations#rendering-another-input-with-as)), so they have no effect together with `as`.

If you use Tailwind v4 in the Nuxt app, set `css: false` and import `semantic-duration-input/tailwind.css` in your main CSS instead, as described in [Getting started](./getting-started#add-the-styles).

# semantic-duration-input

> Vue 3 input component that parses human-friendly durations ("2h", "3 days", "1h30", "1:30", "PT1H30M") into minutes, seconds, milliseconds or ISO 8601, plus a framework-free parser and formatter.

Key facts:

- Needs Vue 3.5+. Install with `npm install semantic-duration-input` and use `import { DurationInput } from 'semantic-duration-input'`.
- `v-model` holds whole minutes by default, and `null` when the field is empty. `valueFormat` switches it to `'seconds'`, `'ms'`, `'iso'` (`'PT1H30M'`) or a custom `{ toModel, fromModel }`.
- Numeric `min`, `max`, `step` and `presets` are in the model's unit. Duration text such as `'8h'` works with every format.
- The core functions work in seconds: `parseDuration` returns `{ ok: true, seconds, minutes }` or `{ ok: false, error, token?, index?, suggestion? }`, and `formatDuration`, `toIso` and the `min`/`max` parse options take seconds. They are also exported without Vue from `semantic-duration-input/core`.
- A bare number (`45`) is a `missing_unit` error unless `defaultUnit` is set. Seconds (`30s`) are only accepted with `precision="second"`.
- Error codes: `empty`, `invalid_format`, `unknown_unit`, `missing_unit`, `out_of_range`.
- Styles: with Tailwind v4, `@import 'semantic-duration-input/tailwind.css';` after `@import 'tailwindcss';`. Without Tailwind, `import 'semantic-duration-input/style.css'`. Neither is needed when rendering another input with `as` or through the renderless default slot.
- UI libraries: `:as="Input"` renders shadcn-vue, Nuxt UI, Vuetify or PrimeVue inputs, with the `nuxtUi`, `vuetify` and `primevue` presets for `invalid-props`.
- Nuxt: add `'semantic-duration-input/nuxt'` to `modules`. It auto-imports the component and adds the stylesheet.
- Forms: `name` submits the model value through a hidden input. `durationSchema()` is a Standard Schema for Valibot, ArkType, TanStack Form, VeeValidate and others.

The whole documentation is in [llms-full.txt](https://nicoalbrecht.github.io/semantic-duration-input/llms-full.txt). The npm package ships both files for its version in `node_modules/semantic-duration-input/dist/`.

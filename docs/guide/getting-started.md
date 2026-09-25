# Getting started

## Install

```sh
npm install semantic-duration-input
```

Vue 3.5 or newer is required.

## Use it

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DurationInput } from 'semantic-duration-input'

const minutes = ref<number | null>(90)
</script>

<template>
  <DurationInput v-model="minutes" placeholder="e.g. 1h 30m" />
</template>
```

<Demo :initial="90" placeholder="e.g. 1h 30m" />

`v-model` holds whole minutes, or `null` when the field is empty. To store seconds, milliseconds or ISO 8601 instead, see [Value formats](./value-formats).

## Add the styles

**With Tailwind v4**, import the Tailwind entry after Tailwind. It lets Tailwind generate the component's classes and adds the design tokens:

```css
@import 'tailwindcss';
@import 'semantic-duration-input/tailwind.css';
```

**Without Tailwind**, import the prebuilt stylesheet. It contains only the utilities the component uses, with no preflight or reset, and is wrapped in cascade layers so your own CSS wins:

```ts
import 'semantic-duration-input/style.css'
```

You don't need either stylesheet if you render your own input with [`as`](./integrations) or the [renderless slot](./integrations#any-other-component-renderless-slot). See [Styling](./styling) for theming.

## Register globally

```ts
import { createApp } from 'vue'
import { plugin as DurationInputPlugin } from 'semantic-duration-input'

createApp(App).use(DurationInputPlugin).mount('#app')
```

The plugin registers `<DurationInput>` and optionally takes [app-wide defaults](./integrations#app-wide-defaults). In Nuxt, use the [Nuxt module](./nuxt) instead.

## Entry points

| Import | Contents |
| --- | --- |
| `semantic-duration-input` | The component, `plugin`, `useDurationInput`, the `invalidProps` presets, the theme, and everything from `/core` |
| `semantic-duration-input/core` | Parser, formatter, locales and `durationSchema`, without Vue or Tailwind ([Headless usage](./headless)) |
| `semantic-duration-input/nuxt` | The [Nuxt module](./nuxt) |
| `semantic-duration-input/style.css` | Prebuilt stylesheet |
| `semantic-duration-input/tailwind.css` | Entry for Tailwind v4 projects |

# Styling

The built-in field is styled with Tailwind CSS v4 utilities. It follows your theme through a few CSS variables, and each variable falls back to the shadcn-vue and Nuxt UI tokens when those are present. See [Getting started](./getting-started#add-the-styles) for which stylesheet to import.

## Sizes and variants

<div class="vp-raw" style="display: grid; gap: 12px; margin: 16px 0">
  <DurationInput v-for="v in ['outline', 'soft', 'ghost']" :key="v" :variant="v" :placeholder="`variant=&quot;${v}&quot;`" />
  <DurationInput size="sm" placeholder='size="sm"' />
  <DurationInput size="lg" placeholder='size="lg"' />
  <DurationInput disabled placeholder="disabled" />
</div>

`size` is `'sm'`, `'md'` (default) or `'lg'`. `variant` is `'outline'` (default), `'soft'` or `'ghost'`.

## Tokens

| Variable | Falls back to (shadcn-vue → Nuxt UI → neutral) |
| --- | --- |
| `--sdi-fg` | `--foreground` → `--ui-text` → `currentColor` |
| `--sdi-bg` | `transparent` |
| `--sdi-border` | `--input` → `--ui-border-accented` → 25% `currentColor` |
| `--sdi-ring` | `--ring` → `--ui-primary` → `Highlight` |
| `--sdi-invalid` | `--destructive` → `--ui-error` → `#dc2626` |
| `--sdi-muted` | `--muted-foreground` → `--ui-text-muted` → 55% `currentColor` |
| `--sdi-soft` | `--muted` → `--ui-bg-elevated` → 8% `currentColor` |
| `--sdi-popover` | `--popover` → `--ui-bg` → `Canvas` |

The neutral fallbacks are derived from `currentColor`, so dark mode works without extra setup. Set the tokens on any ancestor, such as `:root` or a section of your page, or on the component itself:

```css
:root {
  --sdi-ring: var(--color-emerald-500);
}
```

```vue
<DurationInput class="[--sdi-ring:var(--color-emerald-500)] [--sdi-invalid:var(--color-orange-500)]" />
```

<Demo class="[--sdi-border:var(--color-emerald-500)] [--sdi-ring:var(--color-emerald-500)] [--sdi-invalid:var(--color-orange-500)]" validate-on="input" placeholder="Focus me, then type 2 huors" />

This site sets them once on `:root` to follow the VitePress theme.

## Classes per part

Every part takes extra classes through `ui`. They are merged with [tailwind-merge](https://github.com/dcastil/tailwind-merge), so conflicting defaults get replaced: `rounded-full` removes `rounded-md`. A `class` attribute is merged into `root` the same way.

```vue
<DurationInput
  size="lg"
  variant="soft"
  preview
  :ui="{ field: 'rounded-full px-5', preview: 'text-violet-500' }"
>
  <template #leading><ClockIcon class="size-4" /></template>
</DurationInput>
```

<Demo size="lg" variant="soft" preview :ui="{ field: 'rounded-full px-5', preview: 'text-violet-500' }" placeholder="Type 90m">
  <template #leading>⏱</template>
</Demo>

### Structure

```
root
├─ field
│  ├─ leading
│  ├─ input
│  ├─ preview
│  ├─ trailing
│  └─ menu
│     └─ option
└─ message
```

- Each element carries `data-slot="<part>"`.
- The root also carries `data-invalid`, `data-disabled`, `data-size` and `data-variant`. It has the `group` class, so children can use Tailwind variants such as `group-data-invalid:`.
- The input carries `data-error="<code>"` while an error is shown.

## Unstyled

`unstyled` drops all default classes. The root keeps only the `sdi` class plus whatever you pass through `ui`, `class` and the app-wide `ui` defaults. These are joined as-is, without tailwind-merge.

```vue
<DurationInput
  unstyled
  :ui="{ root: 'group', field: 'border-b-2 group-data-invalid:border-red-500', input: 'w-full outline-none' }"
/>
```

<Demo unstyled validate-on="input" placeholder="Type 45" :ui="{ root: 'group', field: 'border-b-2 border-current/30 py-1 group-data-invalid:border-red-500', input: 'w-full outline-none bg-transparent', message: 'text-sm text-red-500' }" />

## Changing the defaults everywhere

For small changes across an app, pass `ui` as an [app-wide default](./integrations#app-wide-defaults). It is merged with the defaults and with each component's own `ui`:

```ts
app.use(DurationInputPlugin, { ui: { field: 'rounded-none', menu: 'rounded-none' } })
```

The default theme is exported as `durationInputTheme`, a [tailwind-variants](https://www.tailwind-variants.org) component. Use it to read the defaults, or as the base for your own theme combined with `unstyled`:

```ts
import { tv } from 'tailwind-variants'
import { durationInputTheme } from 'semantic-duration-input'

const theme = tv({ extend: durationInputTheme, slots: { field: 'rounded-none' } })
const { root, field, input, message } = theme({ size: 'md', variant: 'outline' })
```

```vue
<DurationInput unstyled :ui="{ root: root(), field: field(), input: input(), message: message() }" />
```

Because the root keeps the `group` class, the invalid state can be styled with `group-data-invalid:` classes in your theme.

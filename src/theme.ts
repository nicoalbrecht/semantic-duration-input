import { tv, type VariantProps } from 'tailwind-variants'

/**
 * Default look of `<DurationInput>`. Colors come from the `--sdi-*` variables (see `styles/vars.css`),
 * which fall back to shadcn-vue and Nuxt UI tokens when present.
 *
 * Extend it with `tv({ extend: durationInputTheme, ... })`, or override single parts via the `ui` prop.
 */
export const durationInputTheme = tv({
  slots: {
    root: 'group flex w-full flex-col gap-1.5',
    field:
      'relative flex w-full items-center rounded-md border border-(--_sdi-border) bg-(--_sdi-bg) text-(--_sdi-fg) shadow-xs transition-[color,background-color,border-color,box-shadow] focus-within:border-(--_sdi-ring) focus-within:ring-[3px] focus-within:ring-(--_sdi-ring)/40',
    input:
      'h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 [color:inherit] [font:inherit] outline-none placeholder:text-(--_sdi-muted) disabled:cursor-not-allowed',
    leading: 'flex shrink-0 items-center text-(--_sdi-muted)',
    trailing: 'flex shrink-0 items-center text-(--_sdi-muted)',
    preview: 'pointer-events-none shrink-0 whitespace-nowrap text-(--_sdi-muted) tabular-nums',
    message: 'text-(--_sdi-invalid)',
    menu: 'absolute inset-x-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-(--_sdi-border) bg-(--_sdi-popover) p-1 text-(--_sdi-fg) shadow-md',
    option: 'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 data-active:bg-(--_sdi-soft)',
  },
  variants: {
    size: {
      sm: { field: 'h-8 gap-1.5 px-2.5 text-sm', message: 'text-xs', option: 'px-1.5 py-1 text-xs' },
      md: { field: 'h-9 gap-2 px-3 text-sm', message: 'text-sm', option: 'text-sm' },
      lg: { field: 'h-11 gap-2.5 px-4 text-base', message: 'text-sm', option: 'px-3 py-2 text-base' },
    },
    variant: {
      outline: {},
      soft: { field: 'border-transparent bg-(--_sdi-soft) shadow-none' },
      ghost: { field: 'border-transparent bg-transparent shadow-none hover:bg-(--_sdi-soft) focus-within:bg-(--_sdi-soft)' },
    },
    invalid: {
      true: { field: 'border-(--_sdi-invalid) focus-within:border-(--_sdi-invalid) focus-within:ring-(--_sdi-invalid)/30' },
    },
    disabled: {
      true: { field: 'cursor-not-allowed opacity-50' },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
})

export type DurationInputVariants = VariantProps<typeof durationInputTheme>
export type DurationInputSize = NonNullable<DurationInputVariants['size']>
export type DurationInputVariant = NonNullable<DurationInputVariants['variant']>
export type DurationInputPart = keyof typeof durationInputTheme.slots

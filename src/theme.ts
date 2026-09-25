import { tv, type VariantProps } from 'tailwind-variants'

/**
 * Default look of `<DurationInput>`. Colors come from the `--sdi-*` variables (see `styles/vars.css`),
 * which fall back to shadcn-vue and Nuxt UI tokens when present.
 *
 * Extend it with `tv({ extend: durationInputTheme, ... })`, or override single parts via the `ui` prop.
 */
export const durationInputTheme = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5',
    field:
      'flex w-full items-center rounded-md border border-(--sdi-border) bg-(--sdi-bg) text-(--sdi-fg) shadow-xs transition-[color,background-color,border-color,box-shadow] focus-within:border-(--sdi-ring) focus-within:ring-[3px] focus-within:ring-(--sdi-ring)/40',
    input:
      'h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 [color:inherit] [font:inherit] outline-none placeholder:text-(--sdi-muted) disabled:cursor-not-allowed',
    leading: 'flex shrink-0 items-center text-(--sdi-muted)',
    trailing: 'flex shrink-0 items-center text-(--sdi-muted)',
    preview: 'pointer-events-none shrink-0 whitespace-nowrap text-(--sdi-muted) tabular-nums',
    message: 'text-(--sdi-invalid)',
  },
  variants: {
    size: {
      sm: { field: 'h-8 gap-1.5 px-2.5 text-sm', message: 'text-xs' },
      md: { field: 'h-9 gap-2 px-3 text-sm', message: 'text-sm' },
      lg: { field: 'h-11 gap-2.5 px-4 text-base', message: 'text-sm' },
    },
    variant: {
      outline: {},
      soft: { field: 'border-transparent bg-(--sdi-soft) shadow-none' },
      ghost: { field: 'border-transparent bg-transparent shadow-none hover:bg-(--sdi-soft) focus-within:bg-(--sdi-soft)' },
    },
    invalid: {
      true: { field: 'border-(--sdi-invalid) focus-within:border-(--sdi-invalid) focus-within:ring-(--sdi-invalid)/30' },
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

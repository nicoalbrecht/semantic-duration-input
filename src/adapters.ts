import type { ParseErrorCode } from './core/parse'

/** What an `invalidProps` function receives. */
export interface InvalidState {
  /** Whether an error is shown (see `validateOn`). */
  invalid: boolean
  /** The shown error code. */
  error: ParseErrorCode | null
  /** Localized error text, or `null` when valid or when messages are disabled. */
  message: string | null
  /** Call this when the library signals that the field lost focus, to normalize the text. */
  onBlur: () => void
}

/** Maps the invalid state onto the props of the component passed via `as`. */
export type InvalidPropsFn = (state: InvalidState) => Record<string, unknown>

/** Vuetify `v-text-field`: `error` + `error-messages`. Blur is taken from `update:focused`. */
export const vuetify: InvalidPropsFn = ({ invalid, message, onBlur }) => ({
  error: invalid,
  errorMessages: message ?? [],
  'onUpdate:focused': (focused: boolean) => {
    if (!focused) onBlur()
  },
})

/** PrimeVue `InputText` and friends: `invalid`. */
export const primevue: InvalidPropsFn = ({ invalid }) => ({ invalid })

/** Nuxt UI `UInput`: `color: 'error'` and `highlight` while invalid. */
export const nuxtUi: InvalidPropsFn = ({ invalid }) => ({
  color: invalid ? 'error' : undefined,
  highlight: invalid || undefined,
})

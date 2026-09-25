---
layout: home

hero:
  name: Semantic Duration Input
  text: Durations the way people type them
  tagline: A Vue 3 input that turns "2h", "1h30", "3 Tage" or "PT1H30M" into minutes, seconds, milliseconds or ISO 8601.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground

features:
  - title: Understands people
    details: Units, compound values, decimals, "1:30", ISO 8601, English and German, and "did you mean hours?" for typos.
  - title: Any v-model format
    details: Minutes by default, or seconds, milliseconds, ISO 8601 strings or your own conversion.
  - title: Fits your design system
    details: Styled with Tailwind v4 and themable through tokens. It can also render shadcn-vue, Nuxt UI, Vuetify or PrimeVue inputs, or run headless.
  - title: Accessible and form-ready
    details: ARIA combobox presets, live preview announcements, keyboard stepping, native form submission and Standard Schema validation.
---

## Try it

Type a duration and leave the field, or pick an example.

<Demo
  :initial="90"
  preview
  placeholder="e.g. 1h 30m"
  size="lg"
  :examples="['2h', '3days', '189h', '10 hours', '1h30', '1.5h', '1,5 Std', '1:30', '2 Stunden 15 Minuten', 'PT1H30M']"
/>

| You type | `v-model` |
| --- | --- |
| `2h` | `120` |
| `3days` | `4320` |
| `189h` | `11340` (shown as `7d 21h` after blur) |
| `1h 30m`, `1h30m`, `1h30`, `1 hour and 30 minutes` | `90` |
| `1.5h`, `1,5 Std` | `90` |
| `1:30` | `90` |
| `2 Stunden 15 Minuten` | `135` |
| `PT1H30M` | `90` |
| `45` | error: `missing_unit` (ambiguous) |
| `2 huors` | error: *Unknown unit "huors". Did you mean "hours"?* |

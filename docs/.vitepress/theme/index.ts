import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { DurationInput } from '../../../src'
import Demo from './Demo.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DurationInput', DurationInput)
    app.component('Demo', Demo)
  },
} satisfies Theme

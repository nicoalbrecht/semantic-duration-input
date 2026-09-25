import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { createVuetify } from 'vuetify'
import './style.css'
import 'vuetify/styles'
import App from './App.vue'

createApp(App)
  .use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: '.dark' } } })
  .use(createVuetify())
  .mount('#app')

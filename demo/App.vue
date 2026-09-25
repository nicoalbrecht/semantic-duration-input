<script setup lang="ts">
import { ref } from 'vue'
import { DurationInput, parseDuration, type FormatStyle, type Locale, type ParseErrorCode } from '../src'

const minutes = ref<number | null>(null)
const error = ref<ParseErrorCode | null>(null)
const displayLocale = ref<Locale>('en')
const displayStyle = ref<FormatStyle>('short')

const examples = [
  '2h',
  '3days',
  '189h',
  '10 hours',
  '59 min',
  '1h 30m',
  '2d4h',
  '1.5h',
  '0,5 Tage',
  '1:30',
  '2 Stunden 15 Minuten',
  '45',
  '5 parsecs',
]

const input = ref<InstanceType<typeof DurationInput>>()

function pick(example: string) {
  const result = parseDuration(example)
  minutes.value = result.ok ? result.minutes : null
  input.value?.focus()
}
</script>

<template>
  <main>
    <h1>Semantic Duration Input</h1>
    <p class="lead">Type a duration like <code>2h</code>, <code>1h 30m</code>, <code>1:30</code> or <code>3 Tage</code>, then leave the field.</p>

    <label for="duration">Duration</label>
    <DurationInput
      id="duration"
      ref="input"
      v-model="minutes"
      :display-locale="displayLocale"
      :display-style="displayStyle"
      placeholder="e.g. 1h 30m"
      @error="error = $event"
    />

    <dl>
      <dt>v-model</dt>
      <dd data-testid="minutes">{{ minutes === null ? 'null' : `${minutes} min` }}</dd>
      <dt>error</dt>
      <dd data-testid="error">{{ error ?? '–' }}</dd>
    </dl>

    <fieldset>
      <legend>Display</legend>
      <label><input v-model="displayStyle" type="radio" value="short" /> short</label>
      <label><input v-model="displayStyle" type="radio" value="long" /> long</label>
      <label><input v-model="displayLocale" type="radio" value="en" /> English</label>
      <label><input v-model="displayLocale" type="radio" value="de" /> Deutsch</label>
    </fieldset>

    <h2>Examples</h2>
    <ul class="examples">
      <li v-for="example in examples" :key="example">
        <button type="button" @click="pick(example)">{{ example }}</button>
        <span>→ {{ (r => (r.ok ? `${r.minutes} min` : r.error))(parseDuration(example)) }}</span>
      </li>
    </ul>
  </main>
</template>

<style>
:root {
  font-family: system-ui, sans-serif;
  color-scheme: light dark;
}
main {
  max-width: 36rem;
  margin: 3rem auto;
  padding: 0 1rem;
}
.lead {
  color: GrayText;
}
label[for='duration'] {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.sdi {
  font: inherit;
  font-size: 1.25rem;
  padding: 0.5rem 0.75rem;
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #8884;
  border-radius: 0.5rem;
}
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
}
dt {
  font-weight: 600;
}
dd {
  margin: 0;
  font-family: ui-monospace, monospace;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  border: 1px solid #8884;
  border-radius: 0.5rem;
}
.examples {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.25rem;
}
.examples button {
  font-family: ui-monospace, monospace;
  min-width: 12rem;
  text-align: left;
}
.examples span {
  margin-left: 0.5rem;
  color: GrayText;
}
</style>

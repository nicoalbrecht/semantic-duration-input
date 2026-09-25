<script setup lang="ts">
// Mirrors shadcn-vue's copy-paste `components/ui/input/Input.vue` (Tailwind v4 version).
import type { HTMLAttributes } from 'vue'
import { twMerge } from 'tailwind-merge'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const model = defineModel<string | number>()
</script>

<template>
  <input
    v-model="model"
    data-slot="input"
    :class="
      twMerge(
        'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        props.class as string,
      )
    "
  />
</template>

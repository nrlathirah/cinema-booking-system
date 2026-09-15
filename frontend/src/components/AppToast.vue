<script setup>
import { computed } from 'vue'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()

const typeClass = computed(() => {
  if (toast.type === 'error') return 'border-red-400 text-red-400'
  if (toast.type === 'info') return 'border-border text-ink'
  return 'border-accent text-accent'
})

const icon = computed(() => {
  if (toast.type === 'error') return '✕'
  if (toast.type === 'info') return 'ℹ'
  return '✓'
})
</script>

<template>
  <Transition name="toast">
    <div
      v-if="toast.visible"
      role="alert"
      class="font-display fixed left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-2 border bg-bg px-5 py-3 text-xs font-bold uppercase tracking-wide shadow-lg shadow-black/40"
      :class="typeClass"
    >
      <span aria-hidden="true">{{ icon }}</span>
      {{ toast.message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>

<script setup>
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
</script>

<template>
  <Transition name="toast">
    <div
      v-if="toast.visible"
      class="font-display fixed left-1/2 top-20 z-50 -translate-x-1/2 border border-accent bg-bg px-5 py-3 text-xs font-bold uppercase tracking-wide text-accent shadow-lg shadow-black/40"
    >
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

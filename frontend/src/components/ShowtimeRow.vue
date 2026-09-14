<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  showtime: { type: Object, required: true },
})
const router = useRouter()

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <button
    class="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border py-4 text-left transition-colors hover:bg-white/[0.03] sm:grid-cols-[1fr_70px_120px_50px]"
    @click="router.push(`/showtimes/${showtime.id}/seats`)"
  >
    <span class="font-display truncate text-base font-bold text-ink sm:text-lg">{{ showtime.movie_title }}</span>
    <span class="hidden text-xs text-muted sm:block">{{ showtime.Hall?.name }}</span>
    <span class="text-xs text-muted">{{ formatTime(showtime.start_time) }}</span>
    <span class="text-right text-xs text-accent">→</span>
  </button>
</template>

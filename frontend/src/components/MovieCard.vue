<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  movie: { type: Object, required: true },
})
const router = useRouter()

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(mins) {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}
</script>

<template>
  <div class="group">
    <div class="relative aspect-[2/3] overflow-hidden border border-border bg-white/5">
      <img
        v-if="movie.posterUrl"
        :src="movie.posterUrl"
        :alt="movie.movieTitle"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div v-else class="font-display flex h-full w-full items-center justify-center text-2xl text-muted">
        {{ movie.movieTitle.slice(0, 2).toUpperCase() }}
      </div>
      <div
        class="pointer-events-none absolute inset-0 border border-accent opacity-0 transition-opacity group-hover:opacity-100"
      />
    </div>

    <p class="font-display mt-3 truncate text-sm font-bold text-ink">{{ movie.movieTitle }}</p>
    <p v-if="movie.genre || movie.durationMinutes" class="mt-0.5 text-xs text-muted">
      <span v-if="movie.genre">{{ movie.genre }}</span>
      <span v-if="movie.genre && movie.durationMinutes"> · </span>
      <span v-if="movie.durationMinutes">{{ formatDuration(movie.durationMinutes) }}</span>
    </p>

    <div class="mt-2.5 flex flex-wrap gap-1.5">
      <button
        v-for="s in movie.sessions"
        :key="s.id"
        class="border border-border px-2 py-1 text-[10.5px] text-muted transition-all duration-150 hover:border-accent hover:text-accent active:scale-95"
        @click="router.push(`/showtimes/${s.id}/seats`)"
      >
        {{ formatTime(s.startTime) }}
      </button>
    </div>
  </div>
</template>

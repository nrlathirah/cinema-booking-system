<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  movie: { type: Object, required: true },
})
const router = useRouter()

function formatDuration(mins) {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}
</script>

<template>
  <button class="group block w-full text-left" @click="router.push(`/movies/${encodeURIComponent(movie.movieTitle)}`)">
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
    <p class="mt-1 text-xs text-accent">
      {{ movie.sessions.length }} showtime{{ movie.sessions.length === 1 ? '' : 's' }} →
    </p>
  </button>
</template>

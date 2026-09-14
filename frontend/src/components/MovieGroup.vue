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
  <div class="group flex gap-4 border-b border-border py-5">
    <div
      class="h-32 w-[85px] flex-shrink-0 overflow-hidden border border-border bg-white/5 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-accent-dim"
    >
      <img
        v-if="movie.posterUrl"
        :src="movie.posterUrl"
        :alt="movie.movieTitle"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div v-else class="font-display flex h-full w-full items-center justify-center text-xs text-muted">
        {{ movie.movieTitle.slice(0, 2).toUpperCase() }}
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <p class="font-display text-lg font-bold text-ink">{{ movie.movieTitle }}</p>
      <p v-if="movie.genre || movie.durationMinutes" class="mb-3 text-xs text-muted">
        <span v-if="movie.genre">{{ movie.genre }}</span>
        <span v-if="movie.genre && movie.durationMinutes"> · </span>
        <span v-if="movie.durationMinutes">{{ formatDuration(movie.durationMinutes) }}</span>
      </p>
      <p v-else class="mb-3"></p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in movie.sessions"
          :key="s.id"
          class="border border-border px-3 py-1.5 text-xs text-muted transition-all duration-150 hover:border-accent hover:text-accent active:scale-95"
          @click="router.push(`/showtimes/${s.id}/seats`)"
        >
          {{ formatTime(s.startTime) }} · {{ s.hallName }}
        </button>
      </div>
    </div>
  </div>
</template>

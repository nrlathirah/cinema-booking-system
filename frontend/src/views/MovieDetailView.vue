<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const movieTitle = decodeURIComponent(route.params.title)
const sessions = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/showtimes')
    sessions.value = data.showtimes
      .filter((s) => s.movie_title === movieTitle)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  } finally {
    loading.value = false
  }
})

const movie = computed(() => sessions.value[0] || null)

const sessionsByDate = computed(() => {
  const groups = new Map()
  for (const s of sessions.value) {
    const key = new Date(s.start_time).toLocaleDateString('en-MY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(s)
  }
  return [...groups.entries()]
})

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
  <main class="min-h-screen">
    <p v-if="loading" class="px-6 py-12 text-sm text-muted">Loading...</p>
    <p v-else-if="!movie" class="px-6 py-12 text-sm text-muted">
      Can't find that movie.
      <router-link to="/showtimes" class="text-accent hover:text-accent-dim">Back to showtimes →</router-link>
    </p>

    <template v-else>
      <div class="relative overflow-hidden border-b border-border">
        <div class="aspect-[21/9] sm:aspect-[3/1]">
          <img
            v-if="movie.backdrop_url || movie.poster_url"
            :src="movie.backdrop_url || movie.poster_url"
            :alt="movie.movie_title"
            class="h-full w-full object-cover"
          />
          <div v-else class="h-full w-full bg-white/5" />
          <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        </div>
        <div class="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <button class="mb-3 text-xs text-muted transition-colors hover:text-ink" @click="router.push('/showtimes')">
            ← Back to showtimes
          </button>
          <h1 class="font-display max-w-2xl text-3xl font-extrabold uppercase leading-none text-ink sm:text-5xl">
            {{ movie.movie_title }}
          </h1>
          <p v-if="movie.genre || movie.duration_minutes || movie.rating" class="mt-3 flex items-center gap-2 text-xs text-muted">
            <span v-if="movie.rating" class="font-display font-bold text-accent">★ {{ Number(movie.rating).toFixed(1) }}</span>
            <span v-if="movie.genre">{{ movie.genre }}</span>
            <span v-if="movie.genre && movie.duration_minutes"> · </span>
            <span v-if="movie.duration_minutes">{{ formatDuration(movie.duration_minutes) }}</span>
          </p>
        </div>
      </div>

      <div class="mx-auto max-w-3xl px-6 py-10">
        <p v-if="movie.overview" class="mb-10 max-w-2xl text-sm leading-relaxed text-muted">
          {{ movie.overview }}
        </p>

        <p class="mb-6 text-xs tracking-[0.14em] text-accent">PICK A TIME</p>

        <div v-for="[date, daySessions] in sessionsByDate" :key="date" class="mb-8">
          <p class="font-display mb-3 text-sm font-bold uppercase text-ink">{{ date }}</p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="s in daySessions"
              :key="s.id"
              class="border border-border px-5 py-3 text-sm text-ink transition-all duration-150 hover:border-accent hover:text-accent active:scale-95"
              @click="router.push(`/showtimes/${s.id}/seats`)"
            >
              {{ formatTime(s.start_time) }}
              <span class="ml-2 text-xs text-muted">{{ s.Hall?.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import MovieCard from '../components/MovieCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'

const showtimes = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/showtimes')
    showtimes.value = data.showtimes
  } finally {
    loading.value = false
  }
})

const movies = computed(() => {
  const map = new Map()
  for (const s of showtimes.value) {
    if (!map.has(s.movie_title)) {
      map.set(s.movie_title, {
        movieTitle: s.movie_title,
        posterUrl: s.poster_url,
        genre: s.genre,
        durationMinutes: s.duration_minutes,
        rating: s.rating,
        sessions: [],
      })
    }
    map.get(s.movie_title).sessions.push({ id: s.id, hallName: s.Hall?.name, startTime: s.start_time })
  }
  return [...map.values()]
})
</script>

<template>
  <main class="mx-auto min-h-screen max-w-5xl px-6 py-12">
    <p class="mb-2 text-xs tracking-[0.14em] text-accent">WHAT'S ON</p>
    <h1 class="font-display mb-8 text-3xl font-extrabold uppercase text-ink">Showtimes</h1>

    <div v-if="loading" class="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
      <SkeletonCard v-for="n in 5" :key="n" />
    </div>
    <p v-else-if="movies.length === 0" class="text-sm text-muted">No showtimes yet. Check back soon.</p>
    <div v-else class="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
      <MovieCard v-for="m in movies" :key="m.movieTitle" :movie="m" />
    </div>
  </main>
</template>

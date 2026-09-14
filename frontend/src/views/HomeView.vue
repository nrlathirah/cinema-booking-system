<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import MovieGroup from '../components/MovieGroup.vue'

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
        sessions: [],
      })
    }
    map.get(s.movie_title).sessions.push({ id: s.id, hallName: s.Hall?.name, startTime: s.start_time })
  }
  return [...map.values()].slice(0, 3)
})
</script>

<template>
  <div>
    <header class="mx-auto max-w-4xl px-6 pt-16 pb-10 sm:pt-20">
      <p class="mb-4 text-xs tracking-[0.14em] text-accent">BOOKING TERMINAL / HALL 01–02</p>
      <h1 class="font-display text-[13vw] font-extrabold uppercase leading-[0.9] text-ink sm:text-7xl">
        Book<br />your<br />seat<span class="blink-cursor text-accent">_</span>
      </h1>

      <div class="hud-corners mt-10 flex flex-wrap gap-10 border-y border-border py-5">
        <div class="flex flex-col gap-1 text-xs text-muted">
          <span class="font-display text-xl font-bold text-ink">04</span>
          Halls
        </div>
        <div class="flex flex-col gap-1 text-xs text-muted">
          <span class="font-display text-xl font-bold text-ink">300+</span>
          Seats
        </div>
        <div class="flex flex-col gap-1 text-xs text-muted">
          <span class="font-display text-xl font-bold text-ink">Live</span>
          Seat lock
        </div>
      </div>

      <div class="mt-8 flex flex-wrap gap-3">
        <router-link
          to="/showtimes"
          class="bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim"
        >
          Select seats →
        </router-link>
        <router-link
          to="/menu"
          class="border border-border px-6 py-3 text-xs uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
        >
          Food &amp; drinks
        </router-link>
      </div>
    </header>

    <section v-if="!loading && movies.length > 0" class="mx-auto max-w-4xl px-6 pb-20">
      <div class="mb-1 flex items-baseline justify-between border-b border-border pb-3">
        <h2 class="font-display text-sm font-bold uppercase tracking-wide text-ink">Now Showing</h2>
        <router-link to="/showtimes" class="text-xs text-accent hover:text-accent-dim">See all →</router-link>
      </div>
      <MovieGroup v-for="m in movies" :key="m.movieTitle" :movie="m" />
    </section>
  </div>
</template>

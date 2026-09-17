<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import MovieCard from '../components/MovieCard.vue'

const route = useRoute()
const router = useRouter()

const movieTitle = decodeURIComponent(route.params.title)
const allShowtimes = ref([])
const sessions = ref([])
const loading = ref(true)

const extras = ref(null)
const extrasLoading = ref(false)
const trailerPlaying = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/showtimes')
    allShowtimes.value = data.showtimes
    sessions.value = data.showtimes
      .filter((s) => s.movie_title === movieTitle)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  } finally {
    loading.value = false
  }
})

const movie = computed(() => sessions.value[0] || null)

watch(
  movie,
  async (m) => {
    if (!m?.tmdb_id) return
    extrasLoading.value = true
    try {
      const { data } = await api.get(`/movies/${m.tmdb_id}/extras`)
      extras.value = data
    } catch {
      extras.value = { trailerKey: null, cast: [] }
    } finally {
      extrasLoading.value = false
    }
  },
  { immediate: true },
)

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

const similarMovies = computed(() => {
  if (!movie.value?.genre) return []
  const map = new Map()
  for (const s of allShowtimes.value) {
    if (s.movie_title === movieTitle || s.genre !== movie.value.genre) continue
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
    map.get(s.movie_title).sessions.push({ id: s.id })
  }
  return [...map.values()].slice(0, 6)
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

function formatReleaseDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
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
          <p v-if="movie.tagline" class="mt-2 max-w-xl text-sm italic text-muted">"{{ movie.tagline }}"</p>
          <p
            v-if="movie.genre || movie.duration_minutes || movie.rating || movie.age_rating || movie.release_date"
            class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted"
          >
            <span v-if="movie.rating" class="font-display font-bold text-accent">★ {{ Number(movie.rating).toFixed(1) }}</span>
            <span v-if="movie.age_rating" class="border border-border px-1.5 py-0.5 text-[10px] font-bold text-ink">{{ movie.age_rating }}</span>
            <span v-if="movie.genre">{{ movie.genre }}</span>
            <span v-if="movie.duration_minutes">· {{ formatDuration(movie.duration_minutes) }}</span>
            <span v-if="movie.release_date">· {{ formatReleaseDate(movie.release_date) }}</span>
          </p>
        </div>
      </div>

      <div class="mx-auto max-w-3xl px-6 py-10">
        <p v-if="movie.overview" class="mb-10 max-w-2xl text-sm leading-relaxed text-muted">
          {{ movie.overview }}
        </p>

        <div v-if="extras?.trailerKey" class="mb-10">
          <p class="mb-3 text-xs tracking-[0.14em] text-accent">TRAILER</p>
          <div class="relative aspect-video max-w-xl overflow-hidden border border-border bg-white/5">
            <iframe
              v-if="trailerPlaying"
              :src="`https://www.youtube.com/embed/${extras.trailerKey}?autoplay=1`"
              title="Trailer"
              class="h-full w-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
            <button
              v-else
              class="group flex h-full w-full items-center justify-center"
              @click="trailerPlaying = true"
            >
              <img
                v-if="movie.backdrop_url"
                :src="movie.backdrop_url"
                :alt="`${movie.movie_title} trailer`"
                class="absolute inset-0 h-full w-full object-cover opacity-50"
              />
              <span
                class="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg transition-transform group-hover:scale-110"
              >
                ▶
              </span>
            </button>
          </div>
        </div>

        <div v-if="extras?.cast?.length" class="mb-10">
          <p class="mb-3 text-xs tracking-[0.14em] text-accent">CAST</p>
          <div class="flex gap-4 overflow-x-auto pb-2">
            <div v-for="c in extras.cast" :key="c.name" class="w-20 flex-shrink-0 text-center">
              <div class="mx-auto mb-2 h-20 w-20 overflow-hidden rounded-full border border-border bg-white/5">
                <img v-if="c.photoUrl" :src="c.photoUrl" :alt="c.name" class="h-full w-full object-cover" loading="lazy" />
              </div>
              <p class="truncate text-xs font-bold text-ink">{{ c.name }}</p>
              <p v-if="c.character" class="truncate text-[11px] text-muted">{{ c.character }}</p>
            </div>
          </div>
        </div>

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

        <div v-if="similarMovies.length > 0" class="mt-14 border-t border-border pt-10">
          <p class="mb-6 text-xs tracking-[0.14em] text-accent">YOU MIGHT ALSO LIKE</p>
          <div class="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
            <MovieCard v-for="m in similarMovies" :key="m.movieTitle" :movie="m" />
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import MovieCard from '../components/MovieCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
import FeaturedCarousel from '../components/FeaturedCarousel.vue'

const auth = useAuthStore()

const showtimes = ref([])
const menuItems = ref([])
const comingSoon = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [showtimesRes, menuRes, comingSoonRes] = await Promise.all([
      api.get('/showtimes'),
      api.get('/menu'),
      api.get('/movies/coming-soon').catch(() => ({ data: { movies: [] } })),
    ])
    showtimes.value = showtimesRes.data.showtimes
    menuItems.value = menuRes.data.items.slice(0, 4)
    comingSoon.value = comingSoonRes.data.movies
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
        backdropUrl: s.backdrop_url,
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

const featuredMovies = computed(() => movies.value.slice(0, 5))
// Show different movies than the carousel above; fall back to the front of
// the list if the catalog isn't big enough to have a distinct set.
const nowShowingMovies = computed(() => {
  const rest = movies.value.slice(5, 9)
  return rest.length > 0 ? rest : movies.value.slice(0, 4)
})
const movieCount = computed(() => movies.value.length)
const sessionCount = computed(() => showtimes.value.length)

const searchQuery = ref('')
const selectedGenre = ref('')

const genres = computed(() => [...new Set(movies.value.map((m) => m.genre).filter(Boolean))].sort())

const isFiltering = computed(() => searchQuery.value.trim() !== '' || selectedGenre.value !== '')

const filteredMovies = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return movies.value.filter((m) => {
    const matchesSearch = !q || m.movieTitle.toLowerCase().includes(q)
    const matchesGenre = !selectedGenre.value || m.genre === selectedGenre.value
    return matchesSearch && matchesGenre
  })
})

const displayedMovies = computed(() => (isFiltering.value ? filteredMovies.value : nowShowingMovies.value))

function toggleGenre(g) {
  selectedGenre.value = selectedGenre.value === g ? '' : g
}
function clearFilters() {
  searchQuery.value = ''
  selectedGenre.value = ''
}

function formatReleaseDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

const steps = [
  { n: '01', title: 'Pick a showtime', body: "Browse what's playing and choose your session." },
  { n: '02', title: 'Lock your seat', body: 'Selected live over a socket — nobody else can grab it while you decide.' },
  { n: '03', title: 'Add concessions', body: 'Bundle popcorn & drinks with your booking, or order on their own.' },
]
</script>

<template>
  <div>
    <FeaturedCarousel :movies="featuredMovies">
      <template #hero>
        <div class="mx-auto max-w-4xl">
          <p class="mb-4 flex items-center gap-2 text-xs tracking-[0.14em] text-accent">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            BOOKING TERMINAL
          </p>
          <h1 class="font-display text-[13vw] font-extrabold uppercase leading-[0.9] text-ink sm:text-7xl">
            Book<br />your<br />seat<span class="blink-cursor text-accent">_</span>
          </h1>

          <div class="hud-corners mt-10 flex flex-wrap gap-10 border-y border-border py-5">
            <div class="flex flex-col gap-1 text-xs text-muted">
              <span class="font-display text-xl font-bold text-ink">{{ loading ? '—' : movieCount }}</span>
              Movies
            </div>
            <div class="flex flex-col gap-1 text-xs text-muted">
              <span class="font-display text-xl font-bold text-ink">{{ loading ? '—' : sessionCount }}</span>
              Sessions
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
        </div>
      </template>
    </FeaturedCarousel>

    <router-link
      v-if="!auth.isAuthenticated"
      to="/register"
      class="flex items-center justify-center gap-2 border-y border-accent/30 bg-accent/5 px-6 py-2 text-center text-xs text-ink transition-colors hover:bg-accent/10"
    >
      <span class="text-accent">★</span>
      Earn points on every booking — 100 pts = RM 5 off
      <span class="font-bold text-accent">Join free →</span>
    </router-link>

    <section class="mx-auto max-w-4xl px-6 py-10">
      <div class="mb-4 flex items-baseline justify-between border-b border-border pb-3">
        <h2 class="font-display text-sm font-bold uppercase tracking-wide text-ink">Now Showing</h2>
        <router-link to="/showtimes" class="text-xs text-accent hover:text-accent-dim">See all →</router-link>
      </div>

      <div v-if="!loading" class="mb-6 space-y-3">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search movies..."
          class="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none sm:max-w-xs"
        />
        <div v-if="genres.length > 0" class="flex flex-wrap gap-2">
          <button
            v-for="g in genres"
            :key="g"
            @click="toggleGenre(g)"
            class="border px-3 py-1 text-[11px] uppercase tracking-wide transition-colors"
            :class="
              selectedGenre === g
                ? 'border-accent bg-accent text-bg font-bold'
                : 'border-border text-muted hover:border-accent hover:text-accent'
            "
          >
            {{ g }}
          </button>
          <button
            v-if="isFiltering"
            @click="clearFilters"
            class="px-3 py-1 text-[11px] uppercase tracking-wide text-muted hover:text-ink"
          >
            Clear ✕
          </button>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
        <SkeletonCard v-for="n in 4" :key="n" />
      </div>
      <div v-else-if="displayedMovies.length > 0" class="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
        <MovieCard v-for="m in displayedMovies" :key="m.movieTitle" :movie="m" />
      </div>
      <p v-else-if="isFiltering" class="py-6 text-sm text-muted">No movies match your search.</p>
      <p v-else class="py-6 text-sm text-muted">No showtimes yet. Check back soon.</p>
    </section>

    <section v-if="!loading && comingSoon.length > 0" class="border-t border-border px-6 py-10">
      <div class="mx-auto max-w-4xl">
        <div class="mb-6 border-b border-border pb-3">
          <h2 class="font-display text-sm font-bold uppercase tracking-wide text-ink">Coming Soon</h2>
        </div>
        <div class="flex gap-5 overflow-x-auto pb-2">
          <div v-for="m in comingSoon" :key="m.title" class="w-32 flex-shrink-0 sm:w-36">
            <div class="relative aspect-[2/3] overflow-hidden border border-border bg-white/5">
              <img
                v-if="m.posterUrl"
                :src="m.posterUrl"
                :alt="m.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <span
                class="absolute left-1.5 top-1.5 bg-bg/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted backdrop-blur"
              >
                Soon
              </span>
            </div>
            <p class="font-display mt-2 truncate text-xs font-bold text-ink">{{ m.title }}</p>
            <p v-if="m.releaseDate" class="text-[11px] text-muted">{{ formatReleaseDate(m.releaseDate) }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="border-t border-border px-6 py-14">
      <div class="mx-auto grid max-w-4xl gap-12 sm:grid-cols-2">
        <div>
          <p class="mb-6 text-xs tracking-[0.14em] text-accent">HOW IT WORKS</p>
          <div class="space-y-5">
            <div v-for="step in steps" :key="step.n">
              <p class="font-display mb-1 text-sm font-bold text-ink">{{ step.n }} — {{ step.title }}</p>
              <p class="text-xs leading-relaxed text-muted">{{ step.body }}</p>
            </div>
          </div>
        </div>

        <div v-if="!loading && menuItems.length > 0">
          <div class="mb-6 flex items-baseline justify-between">
            <p class="text-xs tracking-[0.14em] text-accent">CONCESSIONS</p>
            <router-link to="/menu" class="text-xs text-accent hover:text-accent-dim">Order now →</router-link>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <router-link v-for="item in menuItems" :key="item.id" to="/menu" class="group block">
              <div class="aspect-square overflow-hidden border border-border bg-white/5">
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  :alt="item.name"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <p class="font-display mt-2 truncate text-sm font-bold text-ink">{{ item.name }}</p>
              <p class="text-xs text-muted">RM {{ Number(item.price).toFixed(2) }}</p>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import MovieGroup from '../components/MovieGroup.vue'
import SkeletonRow from '../components/SkeletonRow.vue'

const showtimes = ref([])
const menuItems = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [showtimesRes, menuRes] = await Promise.all([api.get('/showtimes'), api.get('/menu')])
    showtimes.value = showtimesRes.data.showtimes
    menuItems.value = menuRes.data.items.slice(0, 4)
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
  return [...map.values()]
})

const movieCount = computed(() => movies.value.length)
const sessionCount = computed(() => showtimes.value.length)
const hallCount = computed(() => new Set(showtimes.value.map((s) => s.Hall?.id).filter(Boolean)).size)

const tickerItems = computed(() => [
  'NOW BOOKING',
  'LIVE SEAT LOCK',
  'INSTANT CONFIRMATION',
  loading.value ? 'HALLS OPEN' : `${hallCount.value} HALL${hallCount.value === 1 ? '' : 'S'} OPEN`,
  'F&B AT YOUR SEAT',
])

const steps = [
  { n: '01', title: 'Pick a showtime', body: "Browse what's playing and choose your session." },
  {
    n: '02',
    title: 'Lock your seat',
    body: 'Select seats live over a socket — nobody else can grab them while you decide.',
  },
  { n: '03', title: 'Add concessions', body: 'Bundle popcorn & drinks with your booking, or order them on their own.' },
]
</script>

<template>
  <div>
    <header class="relative overflow-hidden px-6 pt-16 pb-10 sm:pt-20">
      <div
        class="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl"
      />

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
    </header>

    <div class="overflow-hidden border-y border-border py-2.5">
      <div class="ticker-track flex w-max gap-10 whitespace-nowrap text-[11px] tracking-wide text-muted">
        <template v-for="n in 2" :key="n">
          <template v-for="(t, i) in tickerItems" :key="i">
            <span>{{ t }}</span>
            <span class="text-accent">·</span>
          </template>
        </template>
      </div>
    </div>

    <section class="mx-auto max-w-4xl px-6 py-10">
      <div class="mb-1 flex items-baseline justify-between border-b border-border pb-3">
        <h2 class="font-display text-sm font-bold uppercase tracking-wide text-ink">Now Showing</h2>
        <router-link to="/showtimes" class="text-xs text-accent hover:text-accent-dim">See all →</router-link>
      </div>
      <template v-if="loading">
        <SkeletonRow v-for="n in 3" :key="n" />
      </template>
      <template v-else-if="movies.length > 0">
        <MovieGroup v-for="m in movies.slice(0, 6)" :key="m.movieTitle" :movie="m" />
      </template>
      <p v-else class="py-6 text-sm text-muted">No showtimes yet. Check back soon.</p>
    </section>

    <section class="border-t border-border px-6 py-14">
      <div class="mx-auto max-w-4xl">
        <p class="mb-8 text-xs tracking-[0.14em] text-accent">HOW IT WORKS</p>
        <div class="grid gap-8 sm:grid-cols-3">
          <div v-for="step in steps" :key="step.n">
            <p class="font-display mb-3 text-3xl font-extrabold text-accent">{{ step.n }}</p>
            <p class="font-display mb-1 text-base font-bold text-ink">{{ step.title }}</p>
            <p class="text-xs leading-relaxed text-muted">{{ step.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!loading && menuItems.length > 0" class="border-t border-border px-6 py-14">
      <div class="mx-auto max-w-4xl">
        <div class="mb-6 flex items-baseline justify-between">
          <p class="text-xs tracking-[0.14em] text-accent">CONCESSIONS</p>
          <router-link to="/menu" class="text-xs text-accent hover:text-accent-dim">Order now →</router-link>
        </div>
        <div class="grid grid-cols-2 gap-5 sm:grid-cols-4">
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
    </section>
  </div>
</template>

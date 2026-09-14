<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  movies: { type: Array, required: true },
})
const router = useRouter()

const index = ref(0)
const paused = ref(false)
let timer = null

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function next() {
  index.value = (index.value + 1) % props.movies.length
}
function prev() {
  index.value = (index.value - 1 + props.movies.length) % props.movies.length
}
function goTo(i) {
  index.value = i
}

function startAutoplay() {
  if (reducedMotion || props.movies.length <= 1) return
  timer = setInterval(() => {
    if (!paused.value) next()
  }, 5000)
}

onMounted(startAutoplay)
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function formatDuration(mins) {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

function goToSeats(movie) {
  const firstSession = movie.sessions[0]
  if (firstSession) router.push(`/showtimes/${firstSession.id}/seats`)
}
</script>

<template>
  <div
    v-if="movies.length > 0"
    class="relative overflow-hidden border-y border-border"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div class="relative aspect-[16/9] sm:aspect-[3/1]">
      <div
        v-for="(m, i) in movies"
        :key="m.movieTitle"
        class="absolute inset-0 transition-opacity duration-700"
        :class="i === index ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'"
      >
        <img
          v-if="m.posterUrl"
          :src="m.posterUrl"
          :alt="m.movieTitle"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <div v-else class="h-full w-full bg-white/5" />
        <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />

        <div class="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <p class="mb-2 text-xs tracking-[0.14em] text-accent">FEATURED</p>
          <h3 class="font-display max-w-md text-2xl font-extrabold uppercase leading-none text-ink sm:text-4xl">
            {{ m.movieTitle }}
          </h3>
          <p v-if="m.genre || m.durationMinutes" class="mt-2 text-xs text-muted">
            <span v-if="m.genre">{{ m.genre }}</span>
            <span v-if="m.genre && m.durationMinutes"> · </span>
            <span v-if="m.durationMinutes">{{ formatDuration(m.durationMinutes) }}</span>
          </p>
          <button
            class="mt-4 bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim"
            @click="goToSeats(m)"
          >
            Select seats →
          </button>
        </div>
      </div>
    </div>

    <template v-if="movies.length > 1">
      <button
        aria-label="Previous slide"
        class="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-border bg-bg/70 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent"
        @click="prev"
      >
        ‹
      </button>
      <button
        aria-label="Next slide"
        class="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-border bg-bg/70 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent"
        @click="next"
      >
        ›
      </button>

      <div class="absolute bottom-3 right-3 z-20 flex gap-1.5 sm:bottom-4 sm:right-6">
        <button
          v-for="(m, i) in movies"
          :key="m.movieTitle"
          :aria-label="`Go to slide ${i + 1}`"
          class="h-1.5 w-5 transition-colors"
          :class="i === index ? 'bg-accent' : 'bg-border hover:bg-accent-dim'"
          @click="goTo(i)"
        />
      </div>
    </template>
  </div>
</template>

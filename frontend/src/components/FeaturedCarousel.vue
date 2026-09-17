<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  movies: { type: Array, required: true },
})
const router = useRouter()

// Slide 0 is the "book your seat" hero; movie slides follow after it.
const slideCount = computed(() => props.movies.length + 1)

const index = ref(0)
const paused = ref(false)
// Only the slide the viewer has actually reached gets its (heavy) image
// requested — otherwise every slide's backdrop would load upfront.
const loadedSlides = ref(new Set([1, 2]))
let timer = null

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function goTo(i) {
  index.value = i
  loadedSlides.value.add(i)
}

// Shortest-path offset so slides always slide in from the correct side,
// including when wrapping around from the last slide back to the first.
function offsetFor(i) {
  const total = slideCount.value
  let d = i - index.value
  if (d > total / 2) d -= total
  if (d < -total / 2) d += total
  return d
}
function next() {
  goTo((index.value + 1) % slideCount.value)
}
function prev() {
  goTo((index.value - 1 + slideCount.value) % slideCount.value)
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startAutoplay() {
  stopAutoplay()
  if (reducedMotion || slideCount.value <= 1) return
  timer = setInterval(() => {
    if (!paused.value) next()
  }, 3000)
}

// The carousel mounts before showtimes finish loading (movies starts empty),
// so re-evaluate autoplay whenever the slide count changes — otherwise the
// initial "only 1 slide" check would permanently skip it.
watch(slideCount, startAutoplay)
onMounted(startAutoplay)
onUnmounted(stopAutoplay)

function formatDuration(mins) {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

function goToDetail(movie) {
  router.push(`/movies/${encodeURIComponent(movie.movieTitle)}`)
}
</script>

<template>
  <div
    class="relative overflow-hidden border-b border-border"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div class="relative min-h-[460px] sm:min-h-[500px]">
      <!-- Slide 0: site hero -->
      <div
        class="absolute inset-0 overflow-hidden bg-bg transition-transform duration-700 ease-in-out"
        :class="index === 0 ? 'z-10' : 'z-0 pointer-events-none'"
        :style="{ transform: `translateX(${offsetFor(0) * 100}%)` }"
      >
        <div
          class="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl"
        />
        <div class="flex h-full items-center px-6 sm:px-10">
          <slot name="hero" />
        </div>
      </div>

      <!-- Slides 1..N: featured movies -->
      <div
        v-for="(m, i) in movies"
        :key="m.movieTitle"
        class="absolute inset-0 transition-transform duration-700 ease-in-out"
        :class="i + 1 === index ? 'z-10' : 'z-0 pointer-events-none'"
        :style="{ transform: `translateX(${offsetFor(i + 1) * 100}%)` }"
      >
        <img
          v-if="loadedSlides.has(i + 1) && (m.backdropUrl || m.posterUrl)"
          :src="m.backdropUrl || m.posterUrl"
          :alt="m.movieTitle"
          class="h-full w-full object-cover"
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
            @click="goToDetail(m)"
          >
            View showtimes →
          </button>
        </div>
      </div>
    </div>

    <template v-if="slideCount > 1">
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
          v-for="i in slideCount"
          :key="i"
          :aria-label="`Go to slide ${i}`"
          class="h-1.5 w-5 transition-colors"
          :class="i - 1 === index ? 'bg-accent' : 'bg-border hover:bg-accent-dim'"
          @click="goTo(i - 1)"
        />
      </div>
    </template>
  </div>
</template>

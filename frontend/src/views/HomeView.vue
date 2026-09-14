<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'
import ShowtimeRow from '../components/ShowtimeRow.vue'

const showtimes = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/showtimes')
    showtimes.value = data.showtimes.slice(0, 4)
  } finally {
    loading.value = false
  }
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

    <section v-if="!loading && showtimes.length > 0" class="mx-auto max-w-4xl px-6 pb-20">
      <div class="mb-1 flex items-baseline justify-between border-b border-border pb-3">
        <h2 class="font-display text-sm font-bold uppercase tracking-wide text-ink">Now Showing</h2>
        <router-link to="/showtimes" class="text-xs text-accent hover:text-accent-dim">See all →</router-link>
      </div>
      <ShowtimeRow v-for="s in showtimes" :key="s.id" :showtime="s" />
    </section>
  </div>
</template>

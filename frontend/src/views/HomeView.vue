<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'
import PosterCard from '../components/PosterCard.vue'

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
    <section class="bg-vignette relative border-b border-neutral-800">
      <div class="film-strip" />
      <div class="mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
        <p class="mb-4 text-sm uppercase tracking-[0.3em] text-red-500">Now booking</p>
        <h1 class="font-display text-6xl leading-none tracking-wide text-white sm:text-7xl">
          Your Seat. Your Snacks.
          <span class="text-red-500">One Tap.</span>
        </h1>
        <p class="mx-auto mt-6 max-w-xl text-neutral-400">
          Pick a showtime, grab a seat before anyone else does, and order popcorn &amp; drinks without leaving
          your seat.
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <router-link
            to="/showtimes"
            class="rounded-full bg-red-600 px-8 py-3 font-medium text-white transition-colors hover:bg-red-500"
          >
            Browse Showtimes
          </router-link>
          <router-link
            to="/menu"
            class="rounded-full border border-neutral-700 px-8 py-3 font-medium text-neutral-200 transition-colors hover:border-amber-400 hover:text-amber-400"
          >
            Order Food &amp; Drinks
          </router-link>
        </div>
      </div>
      <div class="film-strip" />
    </section>

    <section v-if="!loading && showtimes.length > 0" class="mx-auto max-w-5xl px-6 py-16">
      <div class="mb-6 flex items-end justify-between">
        <h2 class="font-display text-2xl tracking-wide text-white">Now Showing</h2>
        <router-link to="/showtimes" class="text-sm text-red-400 hover:text-red-300">See all →</router-link>
      </div>
      <div class="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <PosterCard v-for="s in showtimes" :key="s.id" :showtime="s" />
      </div>
    </section>
  </div>
</template>

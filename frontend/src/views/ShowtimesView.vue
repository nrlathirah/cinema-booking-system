<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'
import PosterCard from '../components/PosterCard.vue'

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
</script>

<template>
  <main class="min-h-screen bg-neutral-950 px-6 py-12">
    <div class="mx-auto max-w-5xl">
      <p class="mb-2 text-sm uppercase tracking-[0.3em] text-red-500">Now booking</p>
      <h1 class="font-display mb-10 text-4xl tracking-wide text-white">Showtimes</h1>

      <p v-if="loading" class="text-neutral-400">Loading...</p>
      <p v-else-if="showtimes.length === 0" class="text-neutral-400">No showtimes yet. Check back soon.</p>

      <div v-else class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        <PosterCard v-for="s in showtimes" :key="s.id" :showtime="s" />
      </div>
    </div>
  </main>
</template>

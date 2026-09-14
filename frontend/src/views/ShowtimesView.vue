<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'
import ShowtimeRow from '../components/ShowtimeRow.vue'

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
  <main class="mx-auto min-h-screen max-w-4xl px-6 py-12">
    <p class="mb-2 text-xs tracking-[0.14em] text-accent">BOOKING TERMINAL</p>
    <h1 class="font-display mb-8 text-3xl font-extrabold uppercase text-ink">Showtimes</h1>

    <p v-if="loading" class="text-sm text-muted">Loading...</p>
    <p v-else-if="showtimes.length === 0" class="text-sm text-muted">No showtimes yet. Check back soon.</p>

    <div v-else>
      <div class="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border pb-3 text-[10.5px] uppercase tracking-wide text-muted sm:grid-cols-[1fr_70px_120px_50px]">
        <span>Film</span>
        <span class="hidden sm:block">Hall</span>
        <span>Time</span>
        <span></span>
      </div>
      <ShowtimeRow v-for="s in showtimes" :key="s.id" :showtime="s" />
    </div>
  </main>
</template>

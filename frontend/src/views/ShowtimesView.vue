<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
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

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <main class="min-h-screen bg-neutral-950 text-neutral-100 p-6">
    <h1 class="text-2xl font-semibold mb-6">Showtimes</h1>

    <p v-if="loading" class="text-neutral-400">Loading...</p>
    <p v-else-if="showtimes.length === 0" class="text-neutral-400">No showtimes yet.</p>

    <ul v-else class="space-y-3 max-w-xl">
      <li
        v-for="s in showtimes"
        :key="s.id"
        class="flex items-center justify-between rounded border border-neutral-800 p-4 hover:border-indigo-500 cursor-pointer transition-colors"
        @click="router.push(`/showtimes/${s.id}/seats`)"
      >
        <div>
          <p class="font-medium">{{ s.movie_title }}</p>
          <p class="text-sm text-neutral-400">{{ s.Hall?.name }} · {{ formatTime(s.start_time) }}</p>
        </div>
        <span class="text-indigo-400 text-sm">Select seats →</span>
      </li>
    </ul>
  </main>
</template>

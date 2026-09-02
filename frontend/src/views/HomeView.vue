<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'

const status = ref('checking...')

onMounted(async () => {
  try {
    const res = await api.get('/health')
    status.value = res.data.status
  } catch (err) {
    status.value = 'backend not reachable'
  }
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
    <h1 class="text-3xl font-semibold">SeatFlow</h1>
    <p class="text-neutral-400">Cinema seat booking + F&amp;B ordering</p>
    <p class="text-sm text-neutral-500">API status: {{ status }}</p>
  </main>
</template>

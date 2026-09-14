<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const auth = useAuthStore()
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

    <router-link to="/showtimes" class="rounded bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500">Browse Showtimes</router-link>

    <div v-if="auth.isAuthenticated" class="flex flex-col items-center gap-2">
      <p class="text-sm">Logged in as <span class="font-medium">{{ auth.user?.name }}</span> ({{ auth.user?.role }})</p>
      <button
        @click="auth.logout"
        class="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
      >
        Logout
      </button>
    </div>
    <div v-else class="flex gap-3">
      <router-link to="/login" class="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700">Login</router-link>
      <router-link to="/register" class="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700">Register</router-link>
    </div>
  </main>
</template>

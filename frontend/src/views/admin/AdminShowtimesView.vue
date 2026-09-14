<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'

const showtimes = ref([])
const halls = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)

const form = ref({ movieTitle: '', hallId: '', startTime: '', endTime: '' })

async function load() {
  loading.value = true
  const [showtimesRes, hallsRes] = await Promise.all([api.get('/showtimes'), api.get('/halls')])
  showtimes.value = showtimesRes.data.showtimes
  halls.value = hallsRes.data.halls
  loading.value = false
}

async function createShowtime() {
  error.value = ''
  saving.value = true
  try {
    await api.post('/showtimes', form.value)
    form.value = { movieTitle: '', hallId: '', startTime: '', endTime: '' }
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'failed to create showtime'
  } finally {
    saving.value = false
  }
}

async function removeShowtime(id) {
  if (!confirm('Delete this showtime?')) return
  await api.delete(`/showtimes/${id}`)
  await load()
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-xl font-semibold mb-4">Showtimes</h1>

    <form
      @submit.prevent="createShowtime"
      class="grid grid-cols-2 gap-3 mb-8 bg-neutral-900 p-4 rounded border border-neutral-800"
    >
      <input
        v-model="form.movieTitle"
        placeholder="Movie title"
        required
        class="rounded bg-neutral-800 border border-neutral-700 px-3 py-2 col-span-2"
      />
      <select
        v-model="form.hallId"
        required
        class="rounded bg-neutral-800 border border-neutral-700 px-3 py-2 col-span-2"
      >
        <option value="" disabled>Select hall</option>
        <option v-for="h in halls" :key="h.id" :value="h.id">{{ h.name }}</option>
      </select>
      <input
        v-model="form.startTime"
        type="datetime-local"
        required
        class="rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />
      <input
        v-model="form.endTime"
        type="datetime-local"
        required
        class="rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />
      <p v-if="error" class="text-sm text-red-400 col-span-2">{{ error }}</p>
      <button
        :disabled="saving"
        class="rounded bg-amber-600 px-4 py-2 text-sm text-black font-medium hover:bg-amber-500 disabled:opacity-50 col-span-2"
      >
        {{ saving ? 'Adding...' : 'Add showtime' }}
      </button>
    </form>

    <p v-if="loading" class="text-neutral-400">Loading...</p>
    <table v-else class="w-full text-sm">
      <thead class="text-neutral-400 text-left">
        <tr>
          <th class="pb-2">Movie</th>
          <th class="pb-2">Hall</th>
          <th class="pb-2">Start</th>
          <th class="pb-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in showtimes" :key="s.id" class="border-t border-neutral-800">
          <td class="py-2">{{ s.movie_title }}</td>
          <td class="py-2">{{ s.Hall?.name }}</td>
          <td class="py-2">{{ formatTime(s.start_time) }}</td>
          <td class="py-2 text-right">
            <button @click="removeShowtime(s.id)" class="text-red-400 hover:text-red-300 text-xs">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

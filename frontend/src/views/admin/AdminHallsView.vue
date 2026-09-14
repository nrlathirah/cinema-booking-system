<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'

const halls = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const form = ref({ name: '', rows: 5, seatsPerRow: 8 })

async function load() {
  loading.value = true
  const { data } = await api.get('/halls')
  halls.value = data.halls
  loading.value = false
}

async function createHall() {
  error.value = ''
  saving.value = true
  try {
    await api.post('/halls', form.value)
    form.value = { name: '', rows: 5, seatsPerRow: 8 }
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'failed to create hall'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-xl">
    <h1 class="text-xl font-display font-bold uppercase tracking-wide mb-4">Halls</h1>

    <form
      @submit.prevent="createHall"
      class="grid grid-cols-2 gap-3 mb-8 bg-white/[0.02] p-4 border border-border sm:grid-cols-3"
    >
      <input
        v-model="form.name"
        placeholder="Hall name"
        required
        class="bg-transparent border border-border px-3 py-2 col-span-2 sm:col-span-3"
      />
      <input
        v-model.number="form.rows"
        type="number"
        min="1"
        max="26"
        placeholder="Rows"
        required
        class="bg-transparent border border-border px-3 py-2"
      />
      <input
        v-model.number="form.seatsPerRow"
        type="number"
        min="1"
        placeholder="Seats/row"
        required
        class="bg-transparent border border-border px-3 py-2 sm:col-span-2"
      />
      <p v-if="error" class="text-sm text-red-400 col-span-2 sm:col-span-3">{{ error }}</p>
      <button
        :disabled="saving"
        class="bg-accent px-4 py-2 text-sm text-bg font-medium hover:bg-accent-dim disabled:opacity-50 col-span-2 sm:col-span-3"
      >
        {{ saving ? 'Creating...' : 'Create hall + seat layout' }}
      </button>
    </form>

    <p v-if="loading" class="text-muted">Loading...</p>
    <ul v-else class="space-y-2">
      <li v-for="h in halls" :key="h.id" class="border border-border p-3 text-sm">
        {{ h.name }} — {{ h.rows }} rows × {{ h.seats_per_row }} seats
      </li>
    </ul>
  </div>
</template>

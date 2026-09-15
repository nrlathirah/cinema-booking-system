<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../services/api'
import { useToastStore } from '../../stores/toast'

const toast = useToastStore()

const halls = ref([])
const loading = ref(true)
const loadError = ref('')
const error = ref('')
const saving = ref(false)
const touched = ref(false)
const form = ref({ name: '', rows: 5, seatsPerRow: 8 })

const nameError = computed(() => {
  if (!touched.value) return ''
  return form.value.name.trim() ? '' : 'Hall name is required'
})
const rowsError = computed(() => {
  if (!touched.value) return ''
  const n = Number(form.value.rows)
  return Number.isInteger(n) && n >= 1 && n <= 26 ? '' : 'Rows must be 1-26'
})
const seatsError = computed(() => {
  if (!touched.value) return ''
  const n = Number(form.value.seatsPerRow)
  return Number.isInteger(n) && n >= 1 && n <= 40 ? '' : 'Seats/row must be 1-40'
})
const isValid = computed(() => !nameError.value && !rowsError.value && !seatsError.value && form.value.name.trim())

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get('/halls')
    halls.value = data.halls
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Failed to load halls'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
}

async function createHall() {
  touched.value = true
  error.value = ''
  if (!isValid.value) return
  saving.value = true
  try {
    await api.post('/halls', { ...form.value, name: form.value.name.trim() })
    form.value = { name: '', rows: 5, seatsPerRow: 8 }
    touched.value = false
    toast.success('Hall created')
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create hall'
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
      novalidate
      class="grid grid-cols-2 gap-3 mb-8 bg-white/[0.02] p-4 border border-border sm:grid-cols-3"
    >
      <div class="col-span-2 sm:col-span-3">
        <input
          v-model="form.name"
          placeholder="Hall name"
          class="w-full bg-transparent border px-3 py-2"
          :class="nameError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="nameError" class="mt-1 text-xs text-red-400">{{ nameError }}</p>
      </div>
      <div>
        <input
          v-model.number="form.rows"
          type="number"
          min="1"
          max="26"
          placeholder="Rows"
          class="w-full bg-transparent border px-3 py-2"
          :class="rowsError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="rowsError" class="mt-1 text-xs text-red-400">{{ rowsError }}</p>
      </div>
      <div class="sm:col-span-2">
        <input
          v-model.number="form.seatsPerRow"
          type="number"
          min="1"
          placeholder="Seats/row"
          class="w-full bg-transparent border px-3 py-2"
          :class="seatsError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="seatsError" class="mt-1 text-xs text-red-400">{{ seatsError }}</p>
      </div>
      <p v-if="error" class="text-sm text-red-400 col-span-2 sm:col-span-3">{{ error }}</p>
      <button
        :disabled="saving"
        class="bg-accent px-4 py-2 text-sm text-bg font-medium hover:bg-accent-dim disabled:opacity-50 col-span-2 sm:col-span-3"
      >
        {{ saving ? 'Creating...' : 'Create hall + seat layout' }}
      </button>
    </form>

    <p v-if="loading" class="text-muted">Loading...</p>
    <p v-else-if="loadError" class="text-sm text-red-400">{{ loadError }}</p>
    <p v-else-if="halls.length === 0" class="text-muted text-sm">No halls yet — add one above.</p>
    <ul v-else class="space-y-2">
      <li v-for="h in halls" :key="h.id" class="border border-border p-3 text-sm">
        {{ h.name }} — {{ h.rows }} rows × {{ h.seats_per_row }} seats
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../services/api'
import { useToastStore } from '../../stores/toast'

const toast = useToastStore()

const showtimes = ref([])
const halls = ref([])
const loading = ref(true)
const loadError = ref('')
const error = ref('')
const saving = ref(false)
const touched = ref(false)

const form = ref({
  movieTitle: '',
  hallId: '',
  startTime: '',
  endTime: '',
  posterUrl: '',
  backdropUrl: '',
  genre: '',
  durationMinutes: '',
})

const URL_RE = /^https?:\/\/.+/i

const movieTitleError = computed(() => {
  if (!touched.value) return ''
  return form.value.movieTitle.trim() ? '' : 'Movie title is required'
})
const hallError = computed(() => {
  if (!touched.value) return ''
  return form.value.hallId ? '' : 'Select a hall'
})
const timeError = computed(() => {
  if (!touched.value) return ''
  if (!form.value.startTime || !form.value.endTime) return 'Start and end time are required'
  return new Date(form.value.endTime) > new Date(form.value.startTime)
    ? ''
    : 'End time must be after start time'
})
const durationError = computed(() => {
  if (!touched.value || form.value.durationMinutes === '') return ''
  return Number(form.value.durationMinutes) > 0 ? '' : 'Duration must be greater than 0'
})
const posterUrlError = computed(() => {
  if (!touched.value || !form.value.posterUrl.trim()) return ''
  return URL_RE.test(form.value.posterUrl.trim()) ? '' : 'Enter a valid URL'
})
const backdropUrlError = computed(() => {
  if (!touched.value || !form.value.backdropUrl.trim()) return ''
  return URL_RE.test(form.value.backdropUrl.trim()) ? '' : 'Enter a valid URL'
})
const isValid = computed(
  () =>
    !movieTitleError.value &&
    !hallError.value &&
    !timeError.value &&
    !durationError.value &&
    !posterUrlError.value &&
    !backdropUrlError.value &&
    form.value.movieTitle.trim() &&
    form.value.hallId &&
    form.value.startTime &&
    form.value.endTime,
)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const [showtimesRes, hallsRes] = await Promise.all([api.get('/showtimes'), api.get('/halls')])
    showtimes.value = showtimesRes.data.showtimes
    halls.value = hallsRes.data.halls
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Failed to load showtimes'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
}

async function createShowtime() {
  touched.value = true
  error.value = ''
  if (!isValid.value) return
  saving.value = true
  try {
    await api.post('/showtimes', { ...form.value, movieTitle: form.value.movieTitle.trim() })
    form.value = {
      movieTitle: '',
      hallId: '',
      startTime: '',
      endTime: '',
      posterUrl: '',
      backdropUrl: '',
      genre: '',
      durationMinutes: '',
    }
    touched.value = false
    toast.success('Showtime added')
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create showtime'
  } finally {
    saving.value = false
  }
}

async function removeShowtime(id) {
  if (!confirm('Delete this showtime?')) return
  try {
    await api.delete(`/showtimes/${id}`)
    toast.success('Showtime deleted')
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete showtime')
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-xl font-display font-bold uppercase tracking-wide mb-4">Showtimes</h1>

    <form
      @submit.prevent="createShowtime"
      novalidate
      class="grid grid-cols-1 gap-3 mb-8 bg-white/[0.02] p-4 border border-border sm:grid-cols-2"
    >
      <div class="sm:col-span-2">
        <input
          v-model="form.movieTitle"
          placeholder="Movie title"
          class="w-full bg-transparent border px-3 py-2"
          :class="movieTitleError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="movieTitleError" class="mt-1 text-xs text-red-400">{{ movieTitleError }}</p>
      </div>
      <div class="sm:col-span-2">
        <input
          v-model="form.posterUrl"
          placeholder="Poster URL (optional)"
          class="w-full bg-transparent border px-3 py-2"
          :class="posterUrlError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="posterUrlError" class="mt-1 text-xs text-red-400">{{ posterUrlError }}</p>
      </div>
      <div class="sm:col-span-2">
        <input
          v-model="form.backdropUrl"
          placeholder="Backdrop URL, wide image (optional)"
          class="w-full bg-transparent border px-3 py-2"
          :class="backdropUrlError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="backdropUrlError" class="mt-1 text-xs text-red-400">{{ backdropUrlError }}</p>
      </div>
      <input
        v-model="form.genre"
        placeholder="Genre (optional)"
        class="bg-transparent border border-border px-3 py-2"
      />
      <div>
        <input
          v-model.number="form.durationMinutes"
          type="number"
          min="1"
          placeholder="Duration (min)"
          class="w-full bg-transparent border px-3 py-2"
          :class="durationError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="durationError" class="mt-1 text-xs text-red-400">{{ durationError }}</p>
      </div>
      <div class="sm:col-span-2">
        <select
          v-model="form.hallId"
          class="w-full bg-transparent border px-3 py-2"
          :class="hallError ? 'border-red-400' : 'border-border'"
        >
          <option value="" disabled>Select hall</option>
          <option v-for="h in halls" :key="h.id" :value="h.id">{{ h.name }}</option>
        </select>
        <p v-if="hallError" class="mt-1 text-xs text-red-400">{{ hallError }}</p>
      </div>
      <input
        v-model="form.startTime"
        type="datetime-local"
        class="bg-transparent border border-border px-3 py-2"
      />
      <input
        v-model="form.endTime"
        type="datetime-local"
        class="bg-transparent border border-border px-3 py-2"
      />
      <p v-if="timeError" class="text-xs text-red-400 sm:col-span-2">{{ timeError }}</p>
      <p v-if="error" class="text-sm text-red-400 sm:col-span-2">{{ error }}</p>
      <button
        :disabled="saving"
        class="bg-accent px-4 py-2 text-sm text-bg font-medium hover:bg-accent-dim disabled:opacity-50 sm:col-span-2"
      >
        {{ saving ? 'Adding...' : 'Add showtime' }}
      </button>
    </form>

    <p v-if="loading" class="text-muted">Loading...</p>
    <p v-else-if="loadError" class="text-sm text-red-400">{{ loadError }}</p>
    <p v-else-if="showtimes.length === 0" class="text-muted text-sm">No showtimes yet — add one above.</p>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[480px] text-sm">
        <thead class="text-muted text-left">
          <tr>
            <th class="pb-2"></th>
            <th class="pb-2">Movie</th>
            <th class="pb-2">Hall</th>
            <th class="pb-2">Start</th>
            <th class="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in showtimes"
            :key="s.id"
            class="border-t border-border transition-colors hover:bg-white/[0.02]"
          >
            <td class="py-2">
              <div class="h-14 w-10 overflow-hidden border border-border bg-white/5">
                <img
                  v-if="s.poster_url"
                  :src="s.poster_url"
                  :alt="s.movie_title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </td>
            <td class="py-2">{{ s.movie_title }}</td>
            <td class="py-2">{{ s.Hall?.name }}</td>
            <td class="py-2 whitespace-nowrap">{{ formatTime(s.start_time) }}</td>
            <td class="py-2 text-right">
              <button @click="removeShowtime(s.id)" class="text-red-400 hover:text-red-300 text-xs">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

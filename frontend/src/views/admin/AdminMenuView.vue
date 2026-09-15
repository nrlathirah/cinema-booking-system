<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../services/api'
import { useToastStore } from '../../stores/toast'

const toast = useToastStore()

const items = ref([])
const loading = ref(true)
const loadError = ref('')
const error = ref('')
const saving = ref(false)
const touched = ref(false)
const form = ref({ name: '', category: '', price: '', is_combo: false, image_url: '' })

const URL_RE = /^https?:\/\/.+/i

const nameError = computed(() => {
  if (!touched.value) return ''
  return form.value.name.trim() ? '' : 'Name is required'
})
const categoryError = computed(() => {
  if (!touched.value) return ''
  return form.value.category.trim() ? '' : 'Category is required'
})
const priceError = computed(() => {
  if (!touched.value) return ''
  const n = Number(form.value.price)
  if (form.value.price === '' || Number.isNaN(n)) return 'Price is required'
  return n > 0 ? '' : 'Price must be greater than 0'
})
const imageUrlError = computed(() => {
  if (!touched.value || !form.value.image_url.trim()) return ''
  return URL_RE.test(form.value.image_url.trim()) ? '' : 'Enter a valid URL (starting with http:// or https://)'
})
const isValid = computed(
  () => !nameError.value && !categoryError.value && !priceError.value && !imageUrlError.value && form.value.name.trim(),
)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get('/menu')
    items.value = data.items
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Failed to load menu items'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
}

async function createItem() {
  touched.value = true
  error.value = ''
  if (!isValid.value) return
  saving.value = true
  try {
    await api.post('/menu', {
      ...form.value,
      name: form.value.name.trim(),
      category: form.value.category.trim(),
      image_url: form.value.image_url.trim() || undefined,
    })
    form.value = { name: '', category: '', price: '', is_combo: false, image_url: '' }
    touched.value = false
    toast.success('Menu item added')
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add item'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-xl">
    <h1 class="text-xl font-display font-bold uppercase tracking-wide mb-4">Menu Items</h1>

    <form
      @submit.prevent="createItem"
      novalidate
      class="grid grid-cols-1 gap-3 mb-8 bg-white/[0.02] p-4 border border-border sm:grid-cols-2"
    >
      <div class="sm:col-span-2">
        <input
          v-model="form.name"
          placeholder="Name"
          class="w-full bg-transparent border px-3 py-2"
          :class="nameError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="nameError" class="mt-1 text-xs text-red-400">{{ nameError }}</p>
      </div>
      <div>
        <input
          v-model="form.category"
          placeholder="Category (e.g. drinks)"
          class="w-full bg-transparent border px-3 py-2"
          :class="categoryError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="categoryError" class="mt-1 text-xs text-red-400">{{ categoryError }}</p>
      </div>
      <div>
        <input
          v-model.number="form.price"
          type="number"
          step="0.10"
          min="0"
          placeholder="Price (RM)"
          class="w-full bg-transparent border px-3 py-2"
          :class="priceError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="priceError" class="mt-1 text-xs text-red-400">{{ priceError }}</p>
      </div>
      <div class="sm:col-span-2">
        <input
          v-model="form.image_url"
          placeholder="Image URL (optional)"
          class="w-full bg-transparent border px-3 py-2"
          :class="imageUrlError ? 'border-red-400' : 'border-border'"
        />
        <p v-if="imageUrlError" class="mt-1 text-xs text-red-400">{{ imageUrlError }}</p>
      </div>
      <label class="flex items-center gap-2 text-sm sm:col-span-2">
        <input v-model="form.is_combo" type="checkbox" /> Is combo
      </label>
      <p v-if="error" class="text-sm text-red-400 sm:col-span-2">{{ error }}</p>
      <button
        :disabled="saving"
        class="bg-accent px-4 py-2 text-sm text-bg font-medium hover:bg-accent-dim disabled:opacity-50 sm:col-span-2"
      >
        {{ saving ? 'Adding...' : 'Add item' }}
      </button>
    </form>

    <p v-if="loading" class="text-muted">Loading...</p>
    <p v-else-if="loadError" class="text-sm text-red-400">{{ loadError }}</p>
    <p v-else-if="items.length === 0" class="text-muted text-sm">No menu items yet — add one above.</p>
    <ul v-else class="space-y-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between gap-3 border border-border p-3 text-sm transition-colors hover:bg-white/[0.02]"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="h-10 w-10 flex-shrink-0 overflow-hidden border border-border bg-white/5">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <span class="truncate">{{ item.name }} <span class="text-muted">({{ item.category }})</span></span>
        </div>
        <span class="flex-shrink-0">RM {{ Number(item.price).toFixed(2) }}</span>
      </li>
    </ul>
  </div>
</template>

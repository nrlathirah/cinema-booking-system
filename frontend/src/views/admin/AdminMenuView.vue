<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'

const items = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const form = ref({ name: '', category: '', price: '', is_combo: false })

async function load() {
  loading.value = true
  const { data } = await api.get('/menu')
  items.value = data.items
  loading.value = false
}

async function createItem() {
  error.value = ''
  saving.value = true
  try {
    await api.post('/menu', form.value)
    form.value = { name: '', category: '', price: '', is_combo: false }
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'failed to add item'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-xl">
    <h1 class="text-xl font-semibold mb-4">Menu Items</h1>

    <form
      @submit.prevent="createItem"
      class="grid grid-cols-2 gap-3 mb-8 bg-neutral-900 p-4 rounded border border-neutral-800"
    >
      <input
        v-model="form.name"
        placeholder="Name"
        required
        class="rounded bg-neutral-800 border border-neutral-700 px-3 py-2 col-span-2"
      />
      <input
        v-model="form.category"
        placeholder="Category (e.g. drinks)"
        required
        class="rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />
      <input
        v-model.number="form.price"
        type="number"
        step="0.10"
        min="0"
        placeholder="Price (RM)"
        required
        class="rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />
      <label class="flex items-center gap-2 text-sm col-span-2">
        <input v-model="form.is_combo" type="checkbox" /> Is combo
      </label>
      <p v-if="error" class="text-sm text-red-400 col-span-2">{{ error }}</p>
      <button
        :disabled="saving"
        class="rounded bg-amber-600 px-4 py-2 text-sm text-black font-medium hover:bg-amber-500 disabled:opacity-50 col-span-2"
      >
        {{ saving ? 'Adding...' : 'Add item' }}
      </button>
    </form>

    <p v-if="loading" class="text-neutral-400">Loading...</p>
    <ul v-else class="space-y-2">
      <li v-for="item in items" :key="item.id" class="flex justify-between rounded border border-neutral-800 p-3 text-sm">
        <span>{{ item.name }} <span class="text-neutral-500">({{ item.category }})</span></span>
        <span>RM {{ Number(item.price).toFixed(2) }}</span>
      </li>
    </ul>
  </div>
</template>

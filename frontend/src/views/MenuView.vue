<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const bookingId = route.query.bookingId || null
const items = ref([])
const loading = ref(true)
const error = ref('')
const submitting = ref(false)

const grouped = computed(() => {
  const groups = {}
  for (const item of items.value) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
})

function quantityOf(menuItemId) {
  return cart.items.find((i) => i.menuItemId === menuItemId)?.quantity || 0
}

const categoryIcons = {
  popcorn: '🍿',
  drinks: '🥤',
  snacks: '🌭',
  combo: '🎬',
}

function iconFor(category) {
  return categoryIcons[category] || '🍽️'
}

async function submitOrder() {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  error.value = ''
  submitting.value = true
  try {
    await api.post('/orders', {
      bookingId,
      items: cart.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
    })
    cart.clear()
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'order failed'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/menu')
    items.value = data.items
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="min-h-screen bg-neutral-950 px-6 py-8 pb-32 text-neutral-100">
    <div class="mx-auto max-w-2xl">
      <p class="mb-2 text-xs uppercase tracking-[0.3em] text-red-500">Concessions</p>
      <h1 class="font-display mb-1 text-3xl tracking-wide text-white">Food &amp; Beverages</h1>
      <p v-if="bookingId" class="mb-8 text-sm text-amber-400">
        🎟️ Bundling with your seat booking #{{ bookingId }}
      </p>
      <p v-else class="mb-8 text-sm text-neutral-500">Order F&amp;B on its own</p>

      <p v-if="loading" class="text-neutral-400">Loading menu...</p>

      <div v-else class="space-y-8">
        <div v-for="(group, category) in grouped" :key="category">
          <h2 class="mb-3 flex items-center gap-2 text-lg font-medium capitalize text-neutral-200">
            <span>{{ iconFor(category) }}</span> {{ category }}
          </h2>
          <div class="space-y-2">
            <div
              v-for="item in group"
              :key="item.id"
              class="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 p-3.5 transition-colors hover:border-neutral-700"
            >
              <div>
                <p class="font-medium text-neutral-100">
                  {{ item.name }}
                  <span v-if="item.is_combo" class="ml-1 text-xs text-amber-400">(combo)</span>
                </p>
                <p class="text-sm text-neutral-500">RM {{ Number(item.price).toFixed(2) }}</p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  v-if="quantityOf(item.id) > 0"
                  @click="cart.decrementItem(item.id)"
                  class="h-7 w-7 rounded-full bg-neutral-800 hover:bg-neutral-700"
                >
                  −
                </button>
                <span v-if="quantityOf(item.id) > 0" class="w-4 text-center text-sm">{{ quantityOf(item.id) }}</span>
                <button
                  @click="cart.addItem(item)"
                  class="h-7 w-7 rounded-full bg-red-600 hover:bg-red-500"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="cart.count > 0"
      class="fixed inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-neutral-700 bg-neutral-900/95 p-4 backdrop-blur"
    >
      <div class="mx-auto flex w-full max-w-2xl items-center justify-between">
        <div>
          <p class="text-sm text-neutral-400">{{ cart.count }} item{{ cart.count === 1 ? '' : 's' }}</p>
          <p class="font-medium text-white">RM {{ cart.total.toFixed(2) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
          <button
            :disabled="submitting"
            @click="submitOrder"
            class="rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {{ submitting ? 'Placing order...' : 'Confirm order' }}
          </button>
        </div>
      </div>
    </div>

    <router-link v-else to="/" class="fixed bottom-4 left-6 text-sm text-neutral-500 hover:text-neutral-300">
      Skip, go home →
    </router-link>
  </main>
</template>

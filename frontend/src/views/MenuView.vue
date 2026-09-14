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
  <main class="min-h-screen bg-neutral-950 text-neutral-100 p-6 pb-32">
    <h1 class="text-2xl font-semibold mb-1">Food &amp; Beverages</h1>
    <p v-if="bookingId" class="text-sm text-indigo-400 mb-6">Bundling with your seat booking #{{ bookingId }}</p>
    <p v-else class="text-sm text-neutral-400 mb-6">Order F&amp;B on its own</p>

    <p v-if="loading" class="text-neutral-400">Loading menu...</p>

    <div v-else class="space-y-8 max-w-2xl">
      <div v-for="(group, category) in grouped" :key="category">
        <h2 class="text-lg font-medium mb-3 capitalize">{{ category }}</h2>
        <div class="space-y-2">
          <div
            v-for="item in group"
            :key="item.id"
            class="flex items-center justify-between rounded border border-neutral-800 p-3"
          >
            <div>
              <p class="font-medium">
                {{ item.name }}
                <span v-if="item.is_combo" class="text-xs text-indigo-400">(combo)</span>
              </p>
              <p class="text-sm text-neutral-400">RM {{ Number(item.price).toFixed(2) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-if="quantityOf(item.id) > 0"
                @click="cart.decrementItem(item.id)"
                class="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700"
              >
                −
              </button>
              <span v-if="quantityOf(item.id) > 0" class="w-4 text-center text-sm">{{ quantityOf(item.id) }}</span>
              <button @click="cart.addItem(item)" class="w-7 h-7 rounded bg-indigo-600 hover:bg-indigo-500">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="cart.count > 0"
      class="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 flex items-center justify-between flex-wrap gap-3"
    >
      <div>
        <p class="text-sm text-neutral-400">{{ cart.count }} item{{ cart.count === 1 ? '' : 's' }}</p>
        <p class="font-medium">RM {{ cart.total.toFixed(2) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
        <button
          :disabled="submitting"
          @click="submitOrder"
          class="rounded bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {{ submitting ? 'Placing order...' : 'Confirm order' }}
        </button>
      </div>
    </div>

    <router-link v-else to="/" class="fixed bottom-4 left-6 text-sm text-neutral-400 hover:text-neutral-200">
      Skip, go home →
    </router-link>
  </main>
</template>

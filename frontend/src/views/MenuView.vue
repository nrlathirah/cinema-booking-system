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
  <main class="min-h-screen px-6 py-8 pb-32">
    <div class="mx-auto max-w-2xl">
      <p class="mb-2 text-xs tracking-[0.14em] text-accent">CONCESSIONS MANIFEST</p>
      <h1 class="font-display mb-1 text-3xl font-extrabold uppercase text-ink">Food &amp; Beverages</h1>
      <p v-if="bookingId" class="mb-8 text-xs text-accent">Bundling with seat booking #{{ bookingId }}</p>
      <p v-else class="mb-8 text-xs text-muted">Order F&amp;B on its own</p>

      <p v-if="loading" class="text-sm text-muted">Loading menu...</p>

      <div v-else class="space-y-8">
        <div v-for="(group, category) in grouped" :key="category">
          <h2 class="mb-2 border-b border-border pb-2 text-xs uppercase tracking-[0.14em] text-muted">
            {{ category }}
          </h2>
          <div>
            <div
              v-for="item in group"
              :key="item.id"
              class="flex items-center justify-between gap-3 border-b border-border py-3.5"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div class="h-14 w-14 flex-shrink-0 overflow-hidden border border-border bg-white/5">
                  <img
                    v-if="item.image_url"
                    :src="item.image_url"
                    :alt="item.name"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="min-w-0">
                  <p class="font-display text-sm font-bold text-ink">
                    {{ item.name }}
                    <span v-if="item.is_combo" class="ml-1 text-xs font-normal text-accent">(combo)</span>
                  </p>
                  <p class="text-xs text-muted">RM {{ Number(item.price).toFixed(2) }}</p>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-3">
                <button
                  v-if="quantityOf(item.id) > 0"
                  @click="cart.decrementItem(item.id)"
                  class="h-7 w-7 border border-border text-muted hover:border-accent hover:text-accent"
                >
                  −
                </button>
                <span v-if="quantityOf(item.id) > 0" class="w-4 text-center text-sm text-ink">{{ quantityOf(item.id) }}</span>
                <button
                  @click="cart.addItem(item)"
                  class="h-7 w-7 bg-accent font-bold text-bg hover:bg-accent-dim"
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
      class="fixed inset-x-0 bottom-0 border-t-2 border-border bg-bg/95 p-4 backdrop-blur"
    >
      <div class="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs text-muted">{{ cart.count }} item{{ cart.count === 1 ? '' : 's' }}</p>
          <p class="font-display font-bold text-ink">RM {{ cart.total.toFixed(2) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <p v-if="error" class="text-xs text-accent">{{ error }}</p>
          <button
            :disabled="submitting"
            @click="submitOrder"
            class="bg-accent px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:opacity-50"
          >
            {{ submitting ? 'Placing order...' : 'Confirm order →' }}
          </button>
        </div>
      </div>
    </div>

    <router-link v-else to="/" class="fixed bottom-4 left-6 text-xs text-muted hover:text-ink">
      Skip, go home →
    </router-link>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import PaymentModal from '../components/PaymentModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToastStore()

const bookingId = route.query.bookingId || null
const movieTitle = route.query.movieTitle || null
const items = ref([])
const loading = ref(true)
const loadError = ref('')
const error = ref('')
const submitting = ref(false)
const showPayment = ref(false)

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

function startCheckout() {
  showPayment.value = true
}

async function handlePaid(payload) {
  showPayment.value = false
  await submitOrder(payload)
}

async function submitOrder({ guestName, guestEmail, redeemPoints } = {}) {
  error.value = ''
  submitting.value = true
  try {
    const { data } = await api.post('/orders', {
      bookingId,
      items: cart.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      guestName,
      guestEmail,
      redeemPoints,
    })
    cart.clear()

    if (auth.isAuthenticated) {
      await auth.refreshUser()
      toast.success(`✓ Order placed · +${data.pointsEarned} pts`)
    } else {
      toast.success('✓ Order placed — see you at the movies')
    }
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Order failed. Please try again.'
    toast.error(error.value)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/menu')
    items.value = data.items
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Failed to load the menu'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="min-h-screen px-6 py-8 pb-32">
    <div class="mx-auto max-w-4xl">
      <p class="mb-2 text-xs tracking-[0.14em] text-accent">CONCESSIONS MANIFEST</p>
      <h1 class="font-display mb-1 text-3xl font-extrabold uppercase text-ink">Food &amp; Beverages</h1>
      <p v-if="bookingId" class="mb-8 text-xs text-accent">
        Bundling with your <template v-if="movieTitle">{{ movieTitle }} </template>booking
      </p>
      <p v-else class="mb-8 text-xs text-muted">Order F&amp;B on its own</p>

      <p v-if="loading" class="text-sm text-muted">Loading menu...</p>
      <p v-else-if="loadError" class="text-sm text-red-400">{{ loadError }}</p>

      <div v-else class="space-y-10">
        <div v-for="(group, category) in grouped" :key="category">
          <h2 class="mb-4 border-b border-border pb-2 text-xs uppercase tracking-[0.14em] text-muted">
            {{ category }}
          </h2>
          <div class="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            <div v-for="item in group" :key="item.id" class="group">
              <div class="relative aspect-square overflow-hidden border border-border bg-white/5">
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  :alt="item.name"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span
                  v-if="quantityOf(item.id) > 0"
                  class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center bg-accent text-xs font-bold text-bg"
                >
                  {{ quantityOf(item.id) }}
                </span>
              </div>

              <p class="font-display mt-3 truncate text-sm font-bold text-ink">
                {{ item.name }}
                <span v-if="item.is_combo" class="ml-1 text-xs font-normal text-accent">(combo)</span>
              </p>
              <p class="text-xs text-muted">RM {{ Number(item.price).toFixed(2) }}</p>

              <div class="mt-2.5">
                <button
                  v-if="quantityOf(item.id) === 0"
                  @click="cart.addItem(item)"
                  class="w-full border border-border py-1.5 text-xs uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  Add +
                </button>
                <div v-else class="flex items-center gap-2">
                  <button
                    @click="cart.decrementItem(item.id)"
                    class="h-7 w-7 flex-shrink-0 border border-border text-muted hover:border-accent hover:text-accent"
                  >
                    −
                  </button>
                  <span class="flex-1 text-center text-sm text-ink">{{ quantityOf(item.id) }}</span>
                  <button
                    @click="cart.addItem(item)"
                    class="h-7 w-7 flex-shrink-0 bg-accent font-bold text-bg hover:bg-accent-dim"
                  >
                    +
                  </button>
                </div>
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
      <div class="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs text-muted">{{ cart.count }} item{{ cart.count === 1 ? '' : 's' }}</p>
          <p class="font-display font-bold text-ink">RM {{ cart.total.toFixed(2) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <p v-if="error" class="text-xs text-accent">{{ error }}</p>
          <button
            :disabled="submitting"
            @click="startCheckout"
            class="bg-accent px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:opacity-50"
          >
            {{ submitting ? 'Placing order...' : `Checkout · RM ${cart.total.toFixed(2)} →` }}
          </button>
        </div>
      </div>
    </div>

    <router-link v-else to="/" class="fixed bottom-4 left-6 text-xs text-muted hover:text-ink">
      Skip, go home →
    </router-link>

    <PaymentModal v-if="showPayment" :amount="cart.total" @close="showPayment = false" @paid="handlePaid" />
  </main>
</template>

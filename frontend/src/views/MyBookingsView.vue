<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'

const bookings = ref([])
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [bookingsRes, ordersRes] = await Promise.all([api.get('/bookings/me'), api.get('/orders/me')])
    bookings.value = bookingsRes.data.bookings
    orders.value = ordersRes.data.orders
  } finally {
    loading.value = false
  }
})

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <main class="mx-auto min-h-screen max-w-3xl px-6 py-12">
    <p class="mb-2 text-xs tracking-[0.14em] text-accent">ACCOUNT</p>
    <h1 class="font-display mb-8 text-3xl font-extrabold uppercase text-ink">My Bookings</h1>

    <p v-if="loading" class="text-sm text-muted">Loading...</p>

    <template v-else>
      <section class="mb-12">
        <h2 class="font-display mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wide text-ink">
          Seats
        </h2>
        <p v-if="bookings.length === 0" class="text-sm text-muted">
          No bookings yet.
          <router-link to="/showtimes" class="text-accent hover:text-accent-dim">Browse showtimes →</router-link>
        </p>
        <div v-else class="space-y-3">
          <div
            v-for="b in bookings"
            :key="b.id"
            class="flex items-center gap-4 border border-border p-3 transition-colors hover:bg-white/[0.02]"
          >
            <div class="h-20 w-14 flex-shrink-0 overflow-hidden border border-border bg-white/5">
              <img
                v-if="b.Showtime?.poster_url"
                :src="b.Showtime.poster_url"
                :alt="b.Showtime.movie_title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-display truncate text-sm font-bold text-ink">{{ b.Showtime?.movie_title }}</p>
              <p class="text-xs text-muted">{{ formatTime(b.Showtime?.start_time) }}</p>
              <p class="mt-1 text-xs text-accent">
                Seat {{ b.Seat?.seat_row }}{{ b.Seat?.seat_number }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="font-display mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wide text-ink">
          Orders
        </h2>
        <p v-if="orders.length === 0" class="text-sm text-muted">
          No orders yet.
          <router-link to="/menu" class="text-accent hover:text-accent-dim">Order food &amp; drinks →</router-link>
        </p>
        <div v-else class="space-y-3">
          <div v-for="o in orders" :key="o.id" class="border border-border p-3 text-sm">
            <div class="mb-2 flex justify-between">
              <span class="font-display font-bold text-ink">RM {{ Number(o.total_price).toFixed(2) }}</span>
              <span class="text-xs text-muted">{{ formatTime(o.createdAt) }}</span>
            </div>
            <p v-if="o.booking_id" class="mb-2 text-xs text-accent">Bundled with booking #{{ o.booking_id }}</p>
            <ul class="list-inside list-disc text-xs text-muted">
              <li v-for="oi in o.OrderItems" :key="oi.id">{{ oi.quantity }}× {{ oi.MenuItem?.name }}</li>
            </ul>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

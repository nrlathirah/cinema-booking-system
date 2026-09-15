<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import socket from '../services/socket'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import PaymentModal from '../components/PaymentModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const showtimeId = route.params.id
const showtime = ref(null)
const seats = ref([])
const selected = ref(new Set())
const lockedByOthers = ref(new Set())
const error = ref('')
const confirming = ref(false)
const showPayment = ref(false)
const confirmed = ref(null)

async function loadSeats() {
  const { data } = await api.get(`/showtimes/${showtimeId}/seats`)
  showtime.value = data.showtime
  seats.value = data.seats
}

const selectedSeatLabels = computed(() =>
  seats.value
    .filter((seat) => selected.value.has(seat.id))
    .map((seat) => `${seat.seat_row}${seat.seat_number}`)
    .join(' · '),
)

const totalAmount = computed(() =>
  seats.value.filter((seat) => selected.value.has(seat.id)).reduce((sum, seat) => sum + Number(seat.price), 0),
)

const standardPrice = computed(() => seats.value.find((s) => s.type === 'standard')?.price)
const premiumPrice = computed(() => seats.value.find((s) => s.type === 'premium')?.price)

function seatStatus(seat) {
  if (seat.status === 'taken') return 'taken'
  if (selected.value.has(seat.id)) return 'selected'
  if (lockedByOthers.value.has(seat.id)) return 'locked'
  return 'available'
}

function toggleSeat(seat) {
  const status = seatStatus(seat)
  if (status === 'taken' || status === 'locked') return

  if (status === 'selected') {
    socket.emit('seat:deselect', { showtimeId, seatId: seat.id })
    selected.value.delete(seat.id)
  } else {
    socket.emit('seat:select', { showtimeId, seatId: seat.id })
    selected.value.add(seat.id)
  }
}

async function handlePaid(payload) {
  showPayment.value = false
  await confirmBooking(payload)
}

async function confirmBooking({ guestName, guestEmail, redeemPoints } = {}) {
  error.value = ''
  confirming.value = true
  try {
    const { data } = await api.post('/bookings', {
      showtimeId,
      seatIds: [...selected.value],
      guestName,
      guestEmail,
      redeemPoints,
    })
    const seatLabels = selectedSeatLabels.value
    const total = totalAmount.value
    selected.value.clear()
    const bookingId = data.bookings[0]?.id

    if (auth.isAuthenticated) {
      await auth.refreshUser()
      toast.show(`✓ Booking confirmed · +${data.pointsEarned} pts`)
    } else {
      toast.show('✓ Booking confirmed')
    }

    confirmed.value = {
      bookingId,
      seatLabels,
      total,
      pointsEarned: data.pointsEarned,
      isGuest: !auth.isAuthenticated,
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'booking failed'
    await loadSeats()
  } finally {
    confirming.value = false
  }
}

function goToMenu() {
  router.push({
    path: '/menu',
    query: { bookingId: confirmed.value.bookingId, movieTitle: showtime.value?.movie_title },
  })
}

onMounted(async () => {
  await loadSeats()

  socket.connect()
  socket.emit('showtime:join', showtimeId)

  socket.on('seat:locked', ({ seatId, socketId }) => {
    if (socketId !== socket.id) lockedByOthers.value.add(seatId)
  })
  socket.on('seat:released', ({ seatId }) => {
    lockedByOthers.value.delete(seatId)
  })
  socket.on('seat:select:rejected', ({ seatId }) => {
    selected.value.delete(seatId)
  })
  socket.on('seat:booked', ({ seatIds }) => {
    seatIds.forEach((id) => {
      selected.value.delete(id)
      lockedByOthers.value.delete(id)
      const seat = seats.value.find((s) => s.id === id)
      if (seat) seat.status = 'taken'
    })
  })
})

onBeforeUnmount(() => {
  socket.emit('showtime:leave', showtimeId)
  socket.off('seat:locked')
  socket.off('seat:released')
  socket.off('seat:select:rejected')
  socket.off('seat:booked')
  socket.disconnect()
})
</script>

<template>
  <main v-if="confirmed" class="flex min-h-screen items-center justify-center px-6 py-16">
    <div class="hud-corners w-full max-w-md border border-border p-6">
      <p class="mb-2 text-xs tracking-[0.14em] text-accent">✓ BOOKING CONFIRMED</p>
      <h1 class="font-display mb-1 text-2xl font-bold uppercase text-ink">{{ showtime?.movie_title }}</h1>
      <p class="mb-6 text-xs text-muted">{{ showtime?.Hall?.name }}</p>

      <div class="space-y-2 border-y border-dashed border-border py-4 text-sm">
        <div class="flex justify-between">
          <span class="text-muted">Seats</span>
          <span class="font-display font-bold text-accent">{{ confirmed.seatLabels }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted">Total paid</span>
          <span class="text-ink">RM {{ confirmed.total.toFixed(2) }}</span>
        </div>
        <div v-if="!confirmed.isGuest" class="flex justify-between">
          <span class="text-muted">Points earned</span>
          <span class="text-accent">+{{ confirmed.pointsEarned }} pts</span>
        </div>
      </div>

      <p v-if="confirmed.isGuest" class="mt-4 text-xs text-muted">
        Booked as a guest — this confirmation is your only record.
        <router-link to="/register" class="text-accent hover:text-accent-dim">Create an account</router-link>
        to save bookings and earn points next time.
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          class="bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim"
          @click="goToMenu"
        >
          Add food &amp; drinks →
        </button>
        <router-link
          to="/"
          class="border border-border px-5 py-2.5 text-xs uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
        >
          Done
        </router-link>
      </div>
    </div>
  </main>

  <main v-else class="min-h-screen px-6 py-8 pb-32">
    <div class="mx-auto max-w-lg">
      <button class="mb-4 text-xs text-muted transition-colors hover:text-ink" @click="router.push('/showtimes')">
        ← Back to showtimes
      </button>

      <div v-if="showtime" class="mb-10 flex items-center gap-4">
        <div class="h-36 w-24 flex-shrink-0 overflow-hidden border border-border bg-white/5">
          <img
            v-if="showtime.poster_url"
            :src="showtime.poster_url"
            :alt="showtime.movie_title"
            class="h-full w-full object-cover"
          />
        </div>
        <div>
          <p class="text-xs tracking-[0.14em] text-accent">SELECT YOUR SEATS</p>
          <h1 class="font-display text-2xl font-bold uppercase text-ink">{{ showtime.movie_title }}</h1>
          <p class="text-xs text-muted">{{ showtime.Hall?.name }}</p>
        </div>
      </div>

      <!-- Screen -->
      <div class="mx-auto mb-10 w-full max-w-sm">
        <div
          class="mx-auto h-2 w-full rounded-[100%] bg-gradient-to-b from-accent/40 to-transparent"
          style="box-shadow: 0 10px 40px 8px rgba(45, 212, 191, 0.08)"
        />
        <p class="mt-2 text-center text-[11px] tracking-[0.35em] text-muted">SCREEN</p>
      </div>

      <div class="mb-8 grid gap-2" style="grid-template-columns: repeat(8, minmax(0, 1fr))">
        <button
          v-for="seat in seats"
          :key="seat.id"
          :disabled="seatStatus(seat) === 'taken' || seatStatus(seat) === 'locked'"
          @click="toggleSeat(seat)"
          class="flex aspect-square items-center justify-center border text-[11px] font-medium transition-all duration-150"
          :class="{
            'border-accent-dim/50 bg-transparent text-accent-dim hover:border-accent hover:text-accent':
              seatStatus(seat) === 'available' && seat.type === 'premium',
            'border-border bg-transparent text-muted hover:border-accent hover:text-ink':
              seatStatus(seat) === 'available' && seat.type !== 'premium',
            'scale-105 border-accent bg-accent font-bold text-bg': seatStatus(seat) === 'selected',
            'cursor-not-allowed border-border/50 bg-transparent text-muted/30': seatStatus(seat) === 'taken',
            'animate-pulse cursor-not-allowed border-accent-dim bg-accent-dim/20 text-accent-dim':
              seatStatus(seat) === 'locked',
          }"
        >
          {{ seat.seat_row }}{{ seat.seat_number }}
        </button>
      </div>

      <div class="mb-6 flex flex-wrap gap-4 text-xs text-muted">
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 border border-border"></span>
          Available<template v-if="standardPrice"> (RM {{ Number(standardPrice).toFixed(0) }})</template>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 border border-accent-dim/50 text-accent-dim"></span>
          Premium<template v-if="premiumPrice"> (RM {{ Number(premiumPrice).toFixed(0) }})</template>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 bg-accent"></span> Selected
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 bg-accent-dim/30"></span> Held by others
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 border border-border/50 opacity-50"></span> Taken
        </span>
      </div>

      <p v-if="error" class="mb-4 text-sm text-accent">{{ error }}</p>
    </div>

    <div class="fixed inset-x-0 bottom-0 border-t-2 border-border bg-bg/95 px-6 py-4 backdrop-blur">
      <div class="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs text-muted">{{ selected.size }} seat{{ selected.size === 1 ? '' : 's' }} selected</p>
          <p v-if="selectedSeatLabels" class="font-display truncate text-sm font-bold text-accent">
            {{ selectedSeatLabels }}
          </p>
        </div>
        <button
          :disabled="selected.size === 0 || confirming"
          @click="showPayment = true"
          class="bg-accent px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-30"
        >
          {{ confirming ? 'Booking...' : `Checkout · RM ${totalAmount.toFixed(2)} →` }}
        </button>
      </div>
    </div>

    <PaymentModal v-if="showPayment" :amount="totalAmount" @close="showPayment = false" @paid="handlePaid" />
  </main>
</template>

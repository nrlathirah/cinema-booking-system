<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import socket from '../services/socket'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const showtimeId = route.params.id
const showtime = ref(null)
const seats = ref([])
const selected = ref(new Set())
const lockedByOthers = ref(new Set())
const error = ref('')
const confirming = ref(false)

async function loadSeats() {
  const { data } = await api.get(`/showtimes/${showtimeId}/seats`)
  showtime.value = data.showtime
  seats.value = data.seats
}

function seatStatus(seat) {
  if (seat.status === 'taken') return 'taken'
  if (selected.value.has(seat.id)) return 'selected'
  if (lockedByOthers.value.has(seat.id)) return 'locked'
  return 'available'
}

function toggleSeat(seat) {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
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

async function confirmBooking() {
  error.value = ''
  confirming.value = true
  try {
    const { data } = await api.post('/bookings', { showtimeId, seatIds: [...selected.value] })
    selected.value.clear()
    const bookingId = data.bookings[0]?.id
    router.push({ path: '/menu', query: bookingId ? { bookingId } : {} })
  } catch (err) {
    error.value = err.response?.data?.message || 'booking failed'
    await loadSeats()
  } finally {
    confirming.value = false
  }
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
  <main class="min-h-screen bg-neutral-950 px-6 py-8 pb-32 text-neutral-100">
    <div class="mx-auto max-w-lg">
      <button
        class="mb-4 text-sm text-neutral-400 transition-colors hover:text-white"
        @click="router.push('/showtimes')"
      >
        ← Back to showtimes
      </button>

      <div v-if="showtime" class="mb-10">
        <p class="text-xs uppercase tracking-[0.3em] text-red-500">Select your seats</p>
        <h1 class="font-display text-3xl tracking-wide text-white">{{ showtime.movie_title }}</h1>
        <p class="text-sm text-neutral-500">{{ showtime.Hall?.name }}</p>
      </div>

      <!-- Screen -->
      <div class="mx-auto mb-10 w-full max-w-sm">
        <div
          class="mx-auto h-2 w-full rounded-[100%] bg-gradient-to-b from-neutral-300/50 to-transparent"
          style="box-shadow: 0 10px 40px 8px rgba(255, 255, 255, 0.07)"
        />
        <p class="mt-2 text-center text-[11px] uppercase tracking-[0.35em] text-neutral-600">Screen</p>
      </div>

      <div class="mb-8 grid gap-2" style="grid-template-columns: repeat(8, minmax(0, 1fr))">
        <button
          v-for="seat in seats"
          :key="seat.id"
          :disabled="seatStatus(seat) === 'taken' || seatStatus(seat) === 'locked'"
          @click="toggleSeat(seat)"
          class="flex aspect-square items-center justify-center rounded-t-lg rounded-b-sm border text-[11px] font-medium transition-all duration-150"
          :class="{
            'border-amber-600/50 bg-neutral-900 text-amber-400 hover:border-amber-400 hover:bg-amber-950/40':
              seatStatus(seat) === 'available' && seat.type === 'premium',
            'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-red-500 hover:bg-red-950/30':
              seatStatus(seat) === 'available' && seat.type !== 'premium',
            'scale-105 border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/50':
              seatStatus(seat) === 'selected',
            'cursor-not-allowed border-neutral-800 bg-neutral-900 text-neutral-700 opacity-40':
              seatStatus(seat) === 'taken',
            'cursor-not-allowed animate-pulse border-amber-700 bg-amber-900/40 text-amber-500':
              seatStatus(seat) === 'locked',
          }"
        >
          {{ seat.seat_row }}{{ seat.seat_number }}
        </button>
      </div>

      <div class="mb-6 flex flex-wrap gap-4 text-xs text-neutral-400">
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 rounded border border-neutral-700 bg-neutral-900"></span> Available
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 rounded border border-amber-600/50 bg-neutral-900"></span> Premium
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 rounded bg-red-600"></span> Selected
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 rounded bg-amber-900/40"></span> Held by others
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 rounded border border-neutral-800 bg-neutral-900 opacity-50"></span> Taken
        </span>
      </div>

      <p v-if="error" class="mb-4 text-sm text-red-400">{{ error }}</p>
    </div>

    <div
      class="fixed inset-x-0 bottom-0 border-t border-dashed border-neutral-700 bg-neutral-900/95 px-6 py-4 backdrop-blur"
    >
      <div class="mx-auto flex max-w-lg items-center justify-between">
        <p class="text-sm text-neutral-400">
          {{ selected.size }} seat{{ selected.size === 1 ? '' : 's' }} selected
        </p>
        <button
          :disabled="selected.size === 0 || confirming"
          @click="confirmBooking"
          class="rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {{ confirming ? 'Booking...' : 'Confirm booking' }}
        </button>
      </div>
    </div>
  </main>
</template>

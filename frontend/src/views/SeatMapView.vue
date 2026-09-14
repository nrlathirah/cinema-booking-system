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
  <main class="min-h-screen bg-neutral-950 text-neutral-100 p-6">
    <button class="text-sm text-neutral-400 mb-4" @click="router.push('/showtimes')">← Back</button>

    <div v-if="showtime" class="mb-6">
      <h1 class="text-2xl font-semibold">{{ showtime.movie_title }}</h1>
      <p class="text-neutral-400 text-sm">{{ showtime.Hall?.name }}</p>
    </div>

    <div class="grid gap-2 mb-6" style="grid-template-columns: repeat(8, minmax(0, 1fr)); max-width: 480px">
      <button
        v-for="seat in seats"
        :key="seat.id"
        :disabled="seatStatus(seat) === 'taken' || seatStatus(seat) === 'locked'"
        @click="toggleSeat(seat)"
        class="aspect-square rounded text-xs flex items-center justify-center border transition-colors"
        :class="{
          'bg-neutral-800 border-neutral-700 hover:border-indigo-500': seatStatus(seat) === 'available',
          'bg-indigo-600 border-indigo-500': seatStatus(seat) === 'selected',
          'bg-neutral-900 border-neutral-800 opacity-40 cursor-not-allowed': seatStatus(seat) === 'taken',
          'bg-yellow-700 border-yellow-600 opacity-60 cursor-not-allowed': seatStatus(seat) === 'locked',
        }"
      >
        {{ seat.seat_row }}{{ seat.seat_number }}
      </button>
    </div>

    <div class="flex flex-wrap gap-4 text-xs text-neutral-400 mb-6">
      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-neutral-800 border border-neutral-700 inline-block"></span> Available</span>
      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-indigo-600 inline-block"></span> Selected</span>
      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-yellow-700 inline-block"></span> Held by others</span>
      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-neutral-900 border border-neutral-800 inline-block"></span> Taken</span>
    </div>

    <p v-if="error" class="text-sm text-red-400 mb-4">{{ error }}</p>

    <button
      :disabled="selected.size === 0 || confirming"
      @click="confirmBooking"
      class="rounded bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500 disabled:opacity-50"
    >
      {{ confirming ? 'Booking...' : `Confirm booking (${selected.size} seat${selected.size === 1 ? '' : 's'})` }}
    </button>
  </main>
</template>

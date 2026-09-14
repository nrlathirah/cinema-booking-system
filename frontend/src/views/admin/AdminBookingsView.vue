<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'

const bookings = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data } = await api.get('/bookings')
  bookings.value = data.bookings
  loading.value = false
})

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-xl font-display font-bold uppercase tracking-wide mb-4">All Bookings</h1>

    <p v-if="loading" class="text-muted">Loading...</p>
    <p v-else-if="bookings.length === 0" class="text-muted">No bookings yet.</p>
    <table v-else class="w-full text-sm">
      <thead class="text-muted text-left">
        <tr>
          <th class="pb-2">Customer</th>
          <th class="pb-2">Movie</th>
          <th class="pb-2">Seat</th>
          <th class="pb-2">Booked at</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in bookings" :key="b.id" class="border-t border-border">
          <td class="py-2">{{ b.User?.name }}</td>
          <td class="py-2">{{ b.Showtime?.movie_title }}</td>
          <td class="py-2">{{ b.Seat?.seat_row }}{{ b.Seat?.seat_number }}</td>
          <td class="py-2">{{ formatTime(b.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

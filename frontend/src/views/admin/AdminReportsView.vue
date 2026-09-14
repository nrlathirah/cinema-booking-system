<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'

const loading = ref(true)
const totalBookings = ref(0)
const seatUtilization = ref([])
const mostOrderedItems = ref([])

onMounted(async () => {
  const { data } = await api.get('/reports/summary')
  totalBookings.value = data.totalBookings
  seatUtilization.value = data.seatUtilization
  mostOrderedItems.value = data.mostOrderedItems
  loading.value = false
})

const maxOrderedQuantity = () => Math.max(1, ...mostOrderedItems.value.map((i) => i.totalQuantity))
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-xl font-semibold mb-6">Reports</h1>

    <p v-if="loading" class="text-neutral-400">Loading...</p>

    <div v-else class="space-y-10">
      <!-- Headline stat tile -->
      <div class="rounded border border-neutral-800 p-5">
        <p class="text-sm text-neutral-400 mb-1">Total confirmed bookings</p>
        <p class="text-3xl font-semibold tabular-nums">{{ totalBookings }}</p>
      </div>

      <!-- Seat utilization: single-series magnitude, one hue -->
      <section>
        <h2 class="text-sm font-medium text-neutral-300 mb-3">Seat utilization by showtime</h2>
        <div v-if="seatUtilization.length === 0" class="text-sm text-neutral-500">No showtimes yet.</div>
        <div v-else class="space-y-3">
          <div v-for="s in seatUtilization" :key="s.showtimeId">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-neutral-200">{{ s.movieTitle }}</span>
              <span class="text-neutral-400 tabular-nums">{{ s.booked }} / {{ s.capacity }} seats</span>
            </div>
            <div class="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-indigo-500"
                :style="{ width: `${Math.round(s.utilizationRate * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Most ordered items: ranked magnitude, one hue -->
      <section>
        <h2 class="text-sm font-medium text-neutral-300 mb-3">Most-ordered F&amp;B items</h2>
        <div v-if="mostOrderedItems.length === 0" class="text-sm text-neutral-500">No orders yet.</div>
        <div v-else class="space-y-3">
          <div v-for="item in mostOrderedItems" :key="item.menuItemId">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-neutral-200">{{ item.name }}</span>
              <span class="text-neutral-400 tabular-nums">{{ item.totalQuantity }}</span>
            </div>
            <div class="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-indigo-500"
                :style="{ width: `${Math.round((item.totalQuantity / maxOrderedQuantity()) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

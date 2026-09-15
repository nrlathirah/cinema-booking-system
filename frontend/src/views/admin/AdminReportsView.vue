<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import { useToastStore } from '../../stores/toast'

const toast = useToastStore()
const loading = ref(true)
const loadError = ref('')
const totalBookings = ref(0)
const seatUtilization = ref([])
const mostOrderedItems = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/reports/summary')
    totalBookings.value = data.totalBookings
    seatUtilization.value = data.seatUtilization
    mostOrderedItems.value = data.mostOrderedItems
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Failed to load reports'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
})

const maxOrderedQuantity = () => Math.max(1, ...mostOrderedItems.value.map((i) => i.totalQuantity))
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-xl font-display font-bold uppercase tracking-wide mb-6">Reports</h1>

    <p v-if="loading" class="text-muted">Loading...</p>
    <p v-else-if="loadError" class="text-sm text-red-400">{{ loadError }}</p>

    <div v-else class="space-y-10">
      <!-- Headline stat tile -->
      <div class="hud-corners border border-border p-5">
        <p class="text-sm text-muted mb-1">Total confirmed bookings</p>
        <p class="text-3xl font-display font-bold uppercase tracking-wide tabular-nums">{{ totalBookings }}</p>
      </div>

      <!-- Seat utilization: single-series magnitude, one hue -->
      <section>
        <h2 class="text-sm font-medium text-ink mb-3">Seat utilization by showtime</h2>
        <div v-if="seatUtilization.length === 0" class="text-sm text-muted">No showtimes yet.</div>
        <div v-else class="space-y-3">
          <div v-for="s in seatUtilization" :key="s.showtimeId">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-ink">{{ s.movieTitle }}</span>
              <span class="text-muted tabular-nums">{{ s.booked }} / {{ s.capacity }} seats</span>
            </div>
            <div class="h-2 border border-border overflow-hidden">
              <div
                class="h-full bg-accent"
                :style="{ width: `${Math.round(s.utilizationRate * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Most ordered items: ranked magnitude, one hue -->
      <section>
        <h2 class="text-sm font-medium text-ink mb-3">Most-ordered F&amp;B items</h2>
        <div v-if="mostOrderedItems.length === 0" class="text-sm text-muted">No orders yet.</div>
        <div v-else class="space-y-3">
          <div v-for="item in mostOrderedItems" :key="item.menuItemId">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-ink">{{ item.name }}</span>
              <span class="text-muted tabular-nums">{{ item.totalQuantity }}</span>
            </div>
            <div class="h-2 border border-border overflow-hidden">
              <div
                class="h-full bg-accent"
                :style="{ width: `${Math.round((item.totalQuantity / maxOrderedQuantity()) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'

const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data } = await api.get('/orders')
  orders.value = data.orders
  loading.value = false
})

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-xl font-display font-bold uppercase tracking-wide mb-4">All Orders</h1>

    <p v-if="loading" class="text-muted">Loading...</p>
    <p v-else-if="orders.length === 0" class="text-muted">No orders yet.</p>
    <div v-else class="space-y-3">
      <div v-for="o in orders" :key="o.id" class="border border-border p-3 text-sm transition-colors hover:bg-white/[0.02]">
        <div class="flex justify-between mb-2">
          <span class="font-medium">{{ o.User?.name }}</span>
          <span>RM {{ Number(o.total_price).toFixed(2) }}</span>
        </div>
        <p class="text-muted text-xs mb-2">
          {{ formatTime(o.createdAt) }}
          <span v-if="o.booking_id"> · bundled with booking #{{ o.booking_id }}</span>
        </p>
        <ul class="text-ink text-xs list-disc list-inside">
          <li v-for="oi in o.OrderItems" :key="oi.id">{{ oi.quantity }}× {{ oi.MenuItem?.name }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

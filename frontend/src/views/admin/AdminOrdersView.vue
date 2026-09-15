<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import { useToastStore } from '../../stores/toast'

const toast = useToastStore()
const orders = ref([])
const loading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/orders')
    orders.value = data.orders
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Failed to load orders'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
})

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-xl font-display font-bold uppercase tracking-wide mb-4">All Orders</h1>

    <p v-if="loading" class="text-muted">Loading...</p>
    <p v-else-if="loadError" class="text-sm text-red-400">{{ loadError }}</p>
    <p v-else-if="orders.length === 0" class="text-muted">No orders yet.</p>
    <div v-else class="space-y-3">
      <div v-for="o in orders" :key="o.id" class="border border-border p-3 text-sm transition-colors hover:bg-white/[0.02]">
        <div class="flex justify-between mb-2">
          <span class="font-medium">
            {{ o.User?.name || o.guest_name }}
            <span v-if="!o.User" class="text-[10px] text-accent">GUEST</span>
          </span>
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

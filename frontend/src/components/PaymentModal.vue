<script setup>
import { ref } from 'vue'

const props = defineProps({
  amount: { type: Number, required: true },
})
const emit = defineEmits(['close', 'paid'])

const cardNumber = ref('4242 4242 4242 4242')
const expiry = ref('12/29')
const cvv = ref('123')
const processing = ref(false)

async function pay() {
  processing.value = true
  await new Promise((resolve) => setTimeout(resolve, 1400))
  processing.value = false
  emit('paid')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" @click.self="emit('close')">
    <div class="hud-corners w-full max-w-sm border border-border bg-bg p-6">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-xs tracking-[0.14em] text-accent">MOCK PAYMENT</p>
        <button class="text-muted hover:text-ink" @click="emit('close')">✕</button>
      </div>

      <p class="font-display mb-1 text-2xl font-extrabold text-ink">RM {{ amount.toFixed(2) }}</p>
      <p class="mb-6 text-xs text-muted">Demo checkout — no real payment is processed, no card is charged.</p>

      <div class="space-y-3">
        <input
          v-model="cardNumber"
          placeholder="Card number"
          class="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <div class="flex gap-3">
          <input
            v-model="expiry"
            placeholder="MM/YY"
            class="w-1/2 border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <input
            v-model="cvv"
            placeholder="CVV"
            class="w-1/2 border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <button
        :disabled="processing"
        class="mt-6 w-full bg-accent py-3 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:opacity-60"
        @click="pay"
      >
        {{ processing ? 'Processing…' : `Pay RM ${amount.toFixed(2)} →` }}
      </button>
    </div>
  </div>
</template>

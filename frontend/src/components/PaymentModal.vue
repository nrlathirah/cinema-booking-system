<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  amount: { type: Number, required: true },
})
const emit = defineEmits(['close', 'paid'])

const auth = useAuthStore()

const cardNumber = ref('4242 4242 4242 4242')
const expiry = ref('12/29')
const cvv = ref('123')
const processing = ref(false)

const guestName = ref('')
const guestEmail = ref('')
const redeemPoints = ref(false)

const REDEEM_POINTS_COST = 100
const REDEEM_DISCOUNT_RM = 5

const canRedeem = computed(() => auth.isAuthenticated && (auth.user?.points || 0) >= REDEEM_POINTS_COST)
const displayAmount = computed(() =>
  redeemPoints.value ? Math.max(0, props.amount - REDEEM_DISCOUNT_RM) : props.amount,
)
const canPay = computed(() => auth.isAuthenticated || (guestName.value.trim() && guestEmail.value.trim()))

async function pay() {
  if (!canPay.value) return
  processing.value = true
  await new Promise((resolve) => setTimeout(resolve, 1400))
  processing.value = false
  emit('paid', {
    guestName: guestName.value.trim() || undefined,
    guestEmail: guestEmail.value.trim() || undefined,
    redeemPoints: redeemPoints.value && canRedeem.value,
  })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" @click.self="emit('close')">
    <div class="hud-corners w-full max-w-sm border border-border bg-bg p-6">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-xs tracking-[0.14em] text-accent">MOCK PAYMENT</p>
        <button class="text-muted hover:text-ink" @click="emit('close')">✕</button>
      </div>

      <p class="font-display mb-1 text-2xl font-extrabold text-ink">
        RM {{ displayAmount.toFixed(2) }}
        <span v-if="redeemPoints && canRedeem" class="text-xs font-normal text-muted line-through"
          >RM {{ amount.toFixed(2) }}</span
        >
      </p>
      <p class="mb-6 text-xs text-muted">Demo checkout — no real payment is processed, no card is charged.</p>

      <div v-if="!auth.isAuthenticated" class="mb-4 space-y-3 border border-border p-3">
        <p class="text-[11px] uppercase tracking-wide text-muted">Booking as guest</p>
        <input
          v-model="guestName"
          placeholder="Full name"
          class="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <input
          v-model="guestEmail"
          type="email"
          placeholder="Email"
          class="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <router-link to="/login" class="block text-xs text-accent hover:text-accent-dim" @click="emit('close')">
          Log in instead to earn points →
        </router-link>
      </div>

      <label
        v-if="canRedeem"
        class="mb-4 flex items-center gap-2 border border-border p-3 text-xs text-ink"
      >
        <input v-model="redeemPoints" type="checkbox" />
        Redeem {{ REDEEM_POINTS_COST }} points for RM {{ REDEEM_DISCOUNT_RM.toFixed(2) }} off
        <span class="ml-auto text-muted">({{ auth.user.points }} pts)</span>
      </label>

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
        :disabled="processing || !canPay"
        class="mt-6 w-full bg-accent py-3 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-60"
        @click="pay"
      >
        {{ processing ? 'Processing…' : `Pay RM ${displayAmount.toFixed(2)} →` }}
      </button>
    </div>
  </div>
</template>

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
const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.value.trim()))
const guestOk = computed(
  () => auth.isAuthenticated || (guestName.value.trim().length > 0 && isValidEmail.value),
)

const guestTouched = ref(false)
const guestNameError = computed(() => {
  if (!guestTouched.value || auth.isAuthenticated) return ''
  return guestName.value.trim() ? '' : 'Name is required'
})
const guestEmailError = computed(() => {
  if (auth.isAuthenticated) return ''
  if (!guestEmail.value.trim()) return guestTouched.value ? 'Email is required' : ''
  return isValidEmail.value ? '' : 'Enter a valid email'
})

const cardDigits = computed(() => cardNumber.value.replace(/\s+/g, ''))
const isValidCardNumber = computed(() => /^\d{13,19}$/.test(cardDigits.value))
const isValidExpiry = computed(() => {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry.value.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const expiryDate = new Date(year, month, 1)
  return expiryDate > new Date()
})
const isValidCvv = computed(() => /^\d{3,4}$/.test(cvv.value.trim()))

const cardTouched = ref(false)
const cardNumberError = computed(() => {
  if (!cardTouched.value) return ''
  return isValidCardNumber.value ? '' : 'Enter a valid card number'
})
const expiryError = computed(() => {
  if (!cardTouched.value) return ''
  return isValidExpiry.value ? '' : 'Invalid or expired date'
})
const cvvError = computed(() => {
  if (!cardTouched.value) return ''
  return isValidCvv.value ? '' : 'Invalid CVV'
})

const canPay = computed(
  () => guestOk.value && isValidCardNumber.value && isValidExpiry.value && isValidCvv.value,
)

async function pay() {
  cardTouched.value = true
  guestTouched.value = true
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
        <div>
          <input
            v-model="guestName"
            placeholder="Full name"
            class="w-full border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
            :class="guestNameError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
          />
          <p v-if="guestNameError" class="mt-1 text-xs text-red-400">{{ guestNameError }}</p>
        </div>
        <div>
          <input
            v-model="guestEmail"
            type="email"
            placeholder="Email"
            class="w-full border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
            :class="guestEmailError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
          />
          <p v-if="guestEmailError" class="mt-1 text-xs text-red-400">{{ guestEmailError }}</p>
        </div>
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
        <div>
          <input
            v-model="cardNumber"
            placeholder="Card number"
            inputmode="numeric"
            maxlength="23"
            class="w-full border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
            :class="cardNumberError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
          />
          <p v-if="cardNumberError" class="mt-1 text-xs text-red-400">{{ cardNumberError }}</p>
        </div>
        <div class="flex gap-3">
          <div class="w-1/2">
            <input
              v-model="expiry"
              placeholder="MM/YY"
              maxlength="5"
              class="w-full border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
              :class="expiryError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
            />
            <p v-if="expiryError" class="mt-1 text-xs text-red-400">{{ expiryError }}</p>
          </div>
          <div class="w-1/2">
            <input
              v-model="cvv"
              placeholder="CVV"
              inputmode="numeric"
              maxlength="4"
              class="w-full border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
              :class="cvvError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
            />
            <p v-if="cvvError" class="mt-1 text-xs text-red-400">{{ cvvError }}</p>
          </div>
        </div>
      </div>

      <button
        :disabled="processing"
        class="mt-6 w-full bg-accent py-3 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-60"
        @click="pay"
      >
        {{ processing ? 'Processing…' : `Pay RM ${displayAmount.toFixed(2)} →` }}
      </button>
    </div>
  </div>
</template>

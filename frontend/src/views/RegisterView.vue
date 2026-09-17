<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const touched = ref(false)
const loading = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const nameError = computed(() => {
  if (!touched.value) return ''
  if (!name.value.trim()) return 'Name is required'
  if (name.value.trim().length < 2) return 'Name must be at least 2 characters'
  return ''
})
const emailError = computed(() => {
  if (!touched.value) return ''
  if (!email.value.trim()) return 'Email is required'
  if (!EMAIL_RE.test(email.value.trim())) return 'Enter a valid email address'
  return ''
})
const passwordError = computed(() => {
  if (!touched.value) return ''
  if (!password.value) return 'Password is required'
  if (password.value.length < 8) return 'Password must be at least 8 characters'
  return ''
})
const confirmError = computed(() => {
  if (!touched.value) return ''
  if (!confirmPassword.value) return 'Please confirm your password'
  if (confirmPassword.value !== password.value) return 'Passwords do not match'
  return ''
})
const isValid = computed(
  () =>
    name.value.trim().length >= 2 &&
    EMAIL_RE.test(email.value.trim()) &&
    password.value.length >= 8 &&
    confirmPassword.value === password.value,
)

async function handleSubmit() {
  touched.value = true
  error.value = ''
  if (!isValid.value) return

  loading.value = true
  try {
    await auth.register({ name: name.value.trim(), email: email.value.trim(), password: password.value })
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-[calc(100vh-65px)] items-center justify-center px-6">
    <form
      @submit.prevent="handleSubmit"
      novalidate
      class="hud-corners w-full max-w-sm space-y-4 border border-border p-8"
    >
      <p class="text-center text-xs tracking-[0.14em] text-accent">JOIN KINORA</p>
      <h1 class="font-display text-center text-2xl font-extrabold uppercase text-ink">Register</h1>

      <div>
        <input
          v-model="name"
          type="text"
          placeholder="Name"
          autocomplete="name"
          class="w-full border bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          :class="nameError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
        />
        <p v-if="nameError" class="mt-1 text-xs text-red-400">{{ nameError }}</p>
      </div>

      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          autocomplete="email"
          class="w-full border bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          :class="emailError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
        />
        <p v-if="emailError" class="mt-1 text-xs text-red-400">{{ emailError }}</p>
      </div>

      <div>
        <input
          v-model="password"
          type="password"
          placeholder="Password (min 8 characters)"
          autocomplete="new-password"
          class="w-full border bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          :class="passwordError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
        />
        <p v-if="passwordError" class="mt-1 text-xs text-red-400">{{ passwordError }}</p>
      </div>

      <div>
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm password"
          autocomplete="new-password"
          class="w-full border bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          :class="confirmError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
        />
        <p v-if="confirmError" class="mt-1 text-xs text-red-400">{{ confirmError }}</p>
      </div>

      <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-accent py-2.5 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:opacity-50"
      >
        {{ loading ? 'Creating account...' : 'Register →' }}
      </button>

      <p class="text-center text-xs text-muted">
        Already have an account?
        <router-link to="/login" class="text-accent hover:text-accent-dim">Login</router-link>
      </p>
    </form>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const touched = ref(false)
const loading = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailError = computed(() => {
  if (!touched.value) return ''
  if (!email.value.trim()) return 'Email is required'
  if (!EMAIL_RE.test(email.value.trim())) return 'Enter a valid email address'
  return ''
})
const passwordError = computed(() => {
  if (!touched.value) return ''
  if (!password.value) return 'Password is required'
  return ''
})
const isValid = computed(() => EMAIL_RE.test(email.value.trim()) && password.value.length > 0)

async function handleSubmit() {
  touched.value = true
  error.value = ''
  if (!isValid.value) return

  loading.value = true
  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Check your email and password.'
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
      <p class="text-center text-xs tracking-[0.14em] text-accent">WELCOME BACK</p>
      <h1 class="font-display text-center text-2xl font-extrabold uppercase text-ink">Login</h1>

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
          placeholder="Password"
          autocomplete="current-password"
          class="w-full border bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          :class="passwordError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'"
        />
        <p v-if="passwordError" class="mt-1 text-xs text-red-400">{{ passwordError }}</p>
      </div>

      <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-accent py-2.5 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim disabled:opacity-50"
      >
        {{ loading ? 'Logging in...' : 'Login →' }}
      </button>

      <p class="text-center text-xs text-muted">
        No account?
        <router-link to="/register" class="text-accent hover:text-accent-dim">Register</router-link>
      </p>
    </form>
  </main>
</template>

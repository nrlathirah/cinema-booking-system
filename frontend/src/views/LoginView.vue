<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-[calc(100vh-65px)] items-center justify-center px-6">
    <form
      @submit.prevent="handleSubmit"
      class="hud-corners w-full max-w-sm space-y-4 border border-border p-8"
    >
      <p class="text-center text-xs tracking-[0.14em] text-accent">ACCESS TERMINAL</p>
      <h1 class="font-display text-center text-2xl font-extrabold uppercase text-ink">Login</h1>

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="w-full border border-border bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        class="w-full border border-border bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />

      <p v-if="error" class="text-xs text-accent">{{ error }}</p>

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

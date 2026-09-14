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
  <main class="bg-vignette flex min-h-[calc(100vh-73px)] items-center justify-center text-neutral-100">
    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-sm space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-8 shadow-2xl shadow-black/50"
    >
      <div class="film-strip -mx-8 -mt-8 mb-6 rounded-t-xl" />
      <p class="text-center text-xs uppercase tracking-[0.3em] text-red-500">Welcome back</p>
      <h1 class="font-display text-center text-3xl tracking-wide text-white">Login</h1>

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5 focus:border-red-500 focus:outline-none"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        class="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5 focus:border-red-500 focus:outline-none"
      />

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-full bg-red-600 py-2.5 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
      >
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>

      <p class="text-center text-sm text-neutral-500">
        No account?
        <router-link to="/register" class="text-amber-400 hover:underline">Register</router-link>
      </p>
    </form>
  </main>
</template>

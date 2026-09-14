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
  <main class="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
    <form @submit.prevent="handleSubmit" class="w-full max-w-sm space-y-4 p-6">
      <h1 class="text-2xl font-semibold text-center">Login</h1>

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2 focus:outline-none focus:border-indigo-500"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        class="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2 focus:outline-none focus:border-indigo-500"
      />

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-indigo-600 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
      >
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>

      <p class="text-sm text-neutral-400 text-center">
        No account?
        <router-link to="/register" class="text-indigo-400 hover:underline">Register</router-link>
      </p>
    </form>
  </main>
</template>

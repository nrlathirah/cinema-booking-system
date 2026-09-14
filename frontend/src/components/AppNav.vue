<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur">
    <nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <router-link to="/" class="font-display text-2xl tracking-wide text-neutral-100">
        SEAT<span class="text-red-500">FLOW</span>
      </router-link>

      <div class="flex items-center gap-5 text-sm">
        <router-link
          to="/showtimes"
          class="hidden text-neutral-300 transition-colors hover:text-white sm:inline"
        >
          Showtimes
        </router-link>
        <router-link to="/menu" class="hidden text-neutral-300 transition-colors hover:text-white sm:inline">
          Food &amp; Drinks
        </router-link>
        <router-link
          v-if="auth.isAdmin"
          to="/admin"
          class="hidden text-amber-400 transition-colors hover:text-amber-300 sm:inline"
        >
          Admin
        </router-link>

        <template v-if="auth.isAuthenticated">
          <span class="hidden text-neutral-500 md:inline">{{ auth.user?.name }}</span>
          <button
            @click="handleLogout"
            class="rounded-full border border-neutral-700 px-4 py-1.5 text-neutral-300 transition-colors hover:border-red-500 hover:text-white"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-neutral-300 transition-colors hover:text-white">Login</router-link>
          <router-link
            to="/register"
            class="rounded-full bg-red-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-red-500"
          >
            Sign up
          </router-link>
        </template>
      </div>
    </nav>
  </header>
</template>

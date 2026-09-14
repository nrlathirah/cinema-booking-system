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
  <header class="sticky top-0 z-40 border-b-2 border-border bg-bg/95 backdrop-blur">
    <nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 font-mono">
      <router-link to="/" class="font-display text-[17px] font-extrabold tracking-wide text-ink">
        SEATFLOW
      </router-link>

      <div class="flex items-center gap-0 text-xs">
        <router-link
          to="/showtimes"
          class="hidden border-l border-border px-4 text-muted transition-colors hover:text-ink sm:inline"
        >
          SHOWTIMES
        </router-link>
        <router-link
          to="/menu"
          class="hidden border-l border-border px-4 text-muted transition-colors hover:text-ink sm:inline"
        >
          FOOD &amp; DRINKS
        </router-link>
        <router-link
          v-if="auth.isAdmin"
          to="/admin"
          class="hidden border-l border-border px-4 text-accent transition-colors hover:text-accent-dim sm:inline"
        >
          ADMIN
        </router-link>

        <template v-if="auth.isAuthenticated">
          <span class="hidden border-l border-border px-4 text-muted md:inline">{{ auth.user?.name }}</span>
          <button
            @click="handleLogout"
            class="ml-4 border border-border px-4 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
          >
            LOGOUT
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="border-l border-border px-4 text-muted transition-colors hover:text-ink">
            LOGIN
          </router-link>
          <router-link
            to="/register"
            class="ml-4 bg-accent px-4 py-1.5 font-semibold text-bg transition-colors hover:bg-accent-dim"
          >
            SIGN UP
          </router-link>
        </template>
      </div>
    </nav>
  </header>
</template>

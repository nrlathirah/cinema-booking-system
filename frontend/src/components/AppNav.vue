<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const route = useRoute()

const mobileOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

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
          class="hidden items-center gap-1.5 border-l border-border px-4 text-muted transition-colors hover:text-ink sm:inline-flex"
        >
          FOOD &amp; DRINKS
          <span v-if="cart.count > 0" class="bg-accent px-1.5 py-0.5 text-[10px] font-bold text-bg">{{ cart.count }}</span>
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
            class="ml-4 hidden border border-border px-4 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent sm:inline-block"
          >
            LOGOUT
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="hidden border-l border-border px-4 text-muted transition-colors hover:text-ink sm:inline"
          >
            LOGIN
          </router-link>
          <router-link
            to="/register"
            class="ml-4 hidden bg-accent px-4 py-1.5 font-semibold text-bg transition-colors hover:bg-accent-dim sm:inline-block"
          >
            SIGN UP
          </router-link>
        </template>

        <button
          class="flex h-8 w-8 flex-col items-center justify-center gap-1.5 border border-border sm:hidden"
          :aria-expanded="mobileOpen"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <span
            class="h-px w-4 bg-ink transition-transform"
            :class="mobileOpen ? 'translate-y-[3.5px] rotate-45' : ''"
          />
          <span
            class="h-px w-4 bg-ink transition-transform"
            :class="mobileOpen ? '-translate-y-[3.5px] -rotate-45' : ''"
          />
        </button>
      </div>
    </nav>

    <div v-if="mobileOpen" class="flex flex-col border-t border-border font-mono text-xs sm:hidden">
      <router-link to="/showtimes" class="border-b border-border px-6 py-3 text-muted hover:text-ink">
        SHOWTIMES
      </router-link>
      <router-link
        to="/menu"
        class="flex items-center justify-between border-b border-border px-6 py-3 text-muted hover:text-ink"
      >
        FOOD &amp; DRINKS
        <span v-if="cart.count > 0" class="bg-accent px-1.5 py-0.5 text-[10px] font-bold text-bg">{{ cart.count }}</span>
      </router-link>
      <router-link
        v-if="auth.isAdmin"
        to="/admin"
        class="border-b border-border px-6 py-3 text-accent hover:text-accent-dim"
      >
        ADMIN
      </router-link>

      <template v-if="auth.isAuthenticated">
        <span class="border-b border-border px-6 py-3 text-muted">{{ auth.user?.name }}</span>
        <button class="px-6 py-3 text-left text-muted hover:text-ink" @click="handleLogout">LOGOUT</button>
      </template>
      <template v-else>
        <router-link to="/login" class="border-b border-border px-6 py-3 text-muted hover:text-ink">
          LOGIN
        </router-link>
        <router-link to="/register" class="bg-accent px-6 py-3 font-semibold text-bg">SIGN UP</router-link>
      </template>
    </div>
  </header>
</template>

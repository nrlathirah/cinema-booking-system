<script setup>
</script>

<template>
  <main class="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 text-center">
    <p class="mb-3 text-xs tracking-[0.14em] text-accent">404</p>
    <h1 class="font-display text-5xl font-extrabold uppercase text-ink">
      Page Not Found<span class="blink-cursor text-accent">_</span>
    </h1>
    <p class="mt-4 max-w-sm text-sm text-muted">
      Hmm, that page doesn't exist. Let's get you back to the good stuff.
    </p>
    <router-link
      to="/"
      class="mt-8 bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim"
    >
      Back to home →
    </router-link>
  </main>
</template>

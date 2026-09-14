<script setup>
</script>

<template>
  <main class="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 text-center">
    <p class="mb-3 text-xs tracking-[0.14em] text-accent">ERROR 404</p>
    <h1 class="font-display text-5xl font-extrabold uppercase text-ink">
      Signal Lost<span class="blink-cursor text-accent">_</span>
    </h1>
    <p class="mt-4 max-w-sm text-sm text-muted">
      This route isn't on the schedule. The page you're looking for doesn't exist.
    </p>
    <router-link
      to="/"
      class="mt-8 bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wide text-bg transition-colors hover:bg-accent-dim"
    >
      Back to terminal →
    </router-link>
  </main>
</template>

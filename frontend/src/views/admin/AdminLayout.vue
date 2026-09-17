<script setup>
</script>

<template>
  <div class="min-h-screen">
    <div class="border-b border-border px-6 py-3">
      <p class="text-xs tracking-[0.14em] text-accent">ADMIN</p>
    </div>
    <nav class="flex flex-wrap gap-0 border-b border-border text-xs">
      <router-link
        v-for="tab in ['showtimes', 'halls', 'menu', 'bookings', 'orders', 'reports']"
        :key="tab"
        :to="`/admin/${tab}`"
        class="border-r border-border px-5 py-3 uppercase text-muted transition-colors hover:text-ink"
        active-class="text-accent bg-white/[0.03]"
      >
        {{ tab }}
      </router-link>
    </nav>
    <div class="p-6">
      <router-view />
    </div>
  </div>
</template>

<script setup>
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">
    <div class="border-b border-neutral-800 px-6 py-3">
      <p class="text-xs uppercase tracking-[0.3em] text-amber-500">🎬 Admin</p>
    </div>
    <nav class="flex flex-wrap gap-5 border-b border-neutral-800 px-6 py-3 text-sm">
      <router-link to="/admin/showtimes" class="text-neutral-400 hover:text-amber-400" active-class="text-amber-400">Showtimes</router-link>
      <router-link to="/admin/halls" class="text-neutral-400 hover:text-amber-400" active-class="text-amber-400">Halls</router-link>
      <router-link to="/admin/menu" class="text-neutral-400 hover:text-amber-400" active-class="text-amber-400">Menu</router-link>
      <router-link to="/admin/bookings" class="text-neutral-400 hover:text-amber-400" active-class="text-amber-400">Bookings</router-link>
      <router-link to="/admin/orders" class="text-neutral-400 hover:text-amber-400" active-class="text-amber-400">Orders</router-link>
      <router-link to="/admin/reports" class="text-neutral-400 hover:text-amber-400" active-class="text-amber-400">Reports</router-link>
    </nav>
    <div class="p-6">
      <router-view />
    </div>
  </div>
</template>

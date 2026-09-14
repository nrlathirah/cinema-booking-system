<script setup>
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">
    <nav class="border-b border-neutral-800 p-4 flex gap-4 flex-wrap items-center">
      <router-link to="/" class="text-sm text-neutral-400 hover:text-neutral-200">← Back to site</router-link>
      <span class="text-neutral-700">|</span>
      <router-link to="/admin/showtimes" class="text-sm hover:text-indigo-400" active-class="text-indigo-400">Showtimes</router-link>
      <router-link to="/admin/halls" class="text-sm hover:text-indigo-400" active-class="text-indigo-400">Halls</router-link>
      <router-link to="/admin/menu" class="text-sm hover:text-indigo-400" active-class="text-indigo-400">Menu</router-link>
      <router-link to="/admin/bookings" class="text-sm hover:text-indigo-400" active-class="text-indigo-400">Bookings</router-link>
      <router-link to="/admin/orders" class="text-sm hover:text-indigo-400" active-class="text-indigo-400">Orders</router-link>
    </nav>
    <div class="p-6">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AppNav from './components/AppNav.vue'
</script>

<template>
  <div class="min-h-screen bg-neutral-950">
    <AppNav />
    <router-view />
  </div>
</template>

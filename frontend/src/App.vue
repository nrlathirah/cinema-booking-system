<script setup>
import AppNav from './components/AppNav.vue'
</script>

<template>
  <div class="min-h-screen bg-bg font-mono">
    <AppNav />
    <router-view />
  </div>
</template>

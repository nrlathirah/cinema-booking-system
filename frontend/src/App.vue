<script setup>
import AppNav from './components/AppNav.vue'
import AppToast from './components/AppToast.vue'
</script>

<template>
  <div class="min-h-screen bg-bg font-mono">
    <AppNav />
    <router-view />
    <AppToast />
  </div>
</template>

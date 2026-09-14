<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  showtime: { type: Object, required: true },
})
const router = useRouter()

const gradients = [
  'from-red-700 via-red-950 to-neutral-950',
  'from-amber-600 via-neutral-900 to-neutral-950',
  'from-rose-700 via-neutral-900 to-neutral-950',
  'from-orange-600 via-neutral-900 to-neutral-950',
  'from-red-800 via-neutral-900 to-black',
  'from-yellow-600 via-neutral-900 to-neutral-950',
]

function hashIndex(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash % gradients.length
}

const gradient = computed(() => gradients[hashIndex(props.showtime.movie_title)])

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <button class="group block w-full text-left" @click="router.push(`/showtimes/${showtime.id}/seats`)">
    <div
      class="relative flex aspect-[2/3] items-end overflow-hidden rounded-lg bg-gradient-to-br p-4 shadow-lg shadow-black/40 transition-transform duration-200 group-hover:-translate-y-1"
      :class="gradient"
    >
      <div
        class="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <p class="absolute inset-x-4 top-4 text-xs uppercase tracking-widest text-white/70">Now showing</p>
      <p class="font-display relative text-2xl leading-none text-white drop-shadow-md">
        {{ showtime.movie_title }}
      </p>
    </div>
    <p class="mt-2 truncate text-sm text-neutral-400">
      {{ showtime.Hall?.name }} · {{ formatTime(showtime.start_time) }}
    </p>
  </button>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t-2 border-border px-6 py-10">
    <div class="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="font-display text-base font-extrabold tracking-wide text-ink">SEATFLOW</p>
        <p class="mt-1 max-w-xs text-xs text-muted">
          Book seats, lock them in live, order concessions — all from one terminal.
        </p>
      </div>

      <div class="flex flex-col gap-2 text-xs">
        <p class="text-muted">Navigate</p>
        <router-link to="/showtimes" class="text-ink transition-colors hover:text-accent">Showtimes</router-link>
        <router-link to="/menu" class="text-ink transition-colors hover:text-accent">Food &amp; Drinks</router-link>
      </div>
    </div>

    <div
      class="mx-auto mt-8 flex max-w-5xl flex-col gap-2 border-t border-border pt-4 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between"
    >
      <span>© {{ year }} SeatFlow — a portfolio project</span>
      <span class="flex items-center gap-2">
        <span class="relative flex h-1.5 w-1.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        SYSTEM ONLINE
      </span>
    </div>
  </footer>
</template>

import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    message: '',
    type: 'success',
    visible: false,
    timer: null,
  }),
  actions: {
    show(message, type = 'success', duration = 2800) {
      this.message = message
      this.type = type
      this.visible = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.visible = false
      }, duration)
    },
    success(message, duration) {
      this.show(message, 'success', duration ?? 2800)
    },
    error(message, duration) {
      this.show(message, 'error', duration ?? 3600)
    },
    info(message, duration) {
      this.show(message, 'info', duration ?? 2800)
    },
  },
})

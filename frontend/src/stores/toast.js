import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    message: '',
    visible: false,
    timer: null,
  }),
  actions: {
    show(message, duration = 2400) {
      this.message = message
      this.visible = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.visible = false
      }, duration)
    },
  },
})

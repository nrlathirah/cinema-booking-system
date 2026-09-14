import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  getters: {
    total: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
  },
  actions: {
    addItem(menuItem) {
      const existing = this.items.find((i) => i.menuItemId === menuItem.id)
      if (existing) {
        existing.quantity += 1
      } else {
        this.items.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          quantity: 1,
        })
      }
    },
    decrementItem(menuItemId) {
      const existing = this.items.find((i) => i.menuItemId === menuItemId)
      if (!existing) return

      existing.quantity -= 1
      if (existing.quantity <= 0) {
        this.items = this.items.filter((i) => i.menuItemId !== menuItemId)
      }
    },
    clear() {
      this.items = []
    },
  },
})

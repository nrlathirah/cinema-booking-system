export function calculateOrderTotal(items, menuItemsById) {
  return items.reduce((total, item) => {
    const menuItem = menuItemsById[item.menuItemId]
    if (!menuItem) {
      throw new Error(`menu item ${item.menuItemId} not found`)
    }
    return total + Number(menuItem.price) * item.quantity
  }, 0)
}

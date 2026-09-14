import { describe, expect, it } from 'vitest'
import { calculateOrderTotal } from '../src/utils/pricing.js'

describe('calculateOrderTotal', () => {
  const menuItemsById = {
    1: { id: 1, price: 12.5 },
    2: { id: 2, price: 5 },
  }

  it('sums price * quantity across items', () => {
    const total = calculateOrderTotal(
      [
        { menuItemId: 1, quantity: 2 },
        { menuItemId: 2, quantity: 3 },
      ],
      menuItemsById,
    )
    expect(total).toBe(2 * 12.5 + 3 * 5)
  })

  it('returns 0 for empty items', () => {
    expect(calculateOrderTotal([], menuItemsById)).toBe(0)
  })

  it('throws if a menu item is missing', () => {
    expect(() =>
      calculateOrderTotal([{ menuItemId: 99, quantity: 1 }], menuItemsById),
    ).toThrow('menu item 99 not found')
  })
})

import models from '../models/index.js'

const { MenuItem } = models

export async function listMenu(req, res) {
  const items = await MenuItem.findAll({
    order: [
      ['category', 'ASC'],
      ['name', 'ASC'],
    ],
  })
  res.json({ items })
}

export async function createMenuItem(req, res) {
  const { name, category, price, is_combo, image_url } = req.body

  if (!name || !category || price == null) {
    return res.status(400).json({ message: 'name, category and price are required' })
  }

  const item = await MenuItem.create({ name, category, price, is_combo: !!is_combo, image_url: image_url || null })
  res.status(201).json({ item })
}

export async function updateMenuItem(req, res) {
  const { id } = req.params
  const item = await MenuItem.findByPk(id)
  if (!item) {
    return res.status(404).json({ message: 'menu item not found' })
  }

  const { name, category, price, is_combo, image_url } = req.body
  await item.update({
    ...(name !== undefined && { name }),
    ...(category !== undefined && { category }),
    ...(price !== undefined && { price }),
    ...(is_combo !== undefined && { is_combo }),
    ...(image_url !== undefined && { image_url }),
  })

  res.json({ item })
}

import bcrypt from 'bcrypt'
import models from '../models/index.js'
import { signToken } from '../utils/jwt.js'

const { User } = models

export async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'password must be at least 8 characters' })
    }

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: 'email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password_hash, role: 'customer' })

    const token = signToken({ id: user.id, role: user.role })
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(500).json({ message: 'registration failed', error: err.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'invalid credentials' })
    }

    const token = signToken({ id: user.id, role: user.role })
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ message: 'login failed', error: err.message })
  }
}

export async function me(req, res) {
  const user = await User.findByPk(req.user.id)
  if (!user) return res.status(404).json({ message: 'user not found' })
  res.json({ user })
}

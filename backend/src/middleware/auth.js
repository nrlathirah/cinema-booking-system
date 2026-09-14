import { verifyToken } from '../utils/jwt.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'missing or invalid authorization header' })
  }

  const token = header.slice(7)
  try {
    req.user = verifyToken(token)
    next()
  } catch (err) {
    res.status(401).json({ message: 'invalid or expired token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'forbidden' })
    }
    next()
  }
}

import { Router } from 'express'
import { getSummary } from '../controllers/reportController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/summary', requireAuth, requireRole('admin'), getSummary)

export default router

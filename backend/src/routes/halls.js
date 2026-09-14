import { Router } from 'express'
import { listHalls, createHall } from '../controllers/hallController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin'), listHalls)
router.post('/', requireAuth, requireRole('admin'), createHall)

export default router

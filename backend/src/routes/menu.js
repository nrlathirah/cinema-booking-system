import { Router } from 'express'
import { listMenu, createMenuItem, updateMenuItem } from '../controllers/menuController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', listMenu)
router.post('/', requireAuth, requireRole('admin'), createMenuItem)
router.patch('/:id', requireAuth, requireRole('admin'), updateMenuItem)

export default router

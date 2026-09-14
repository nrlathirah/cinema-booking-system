import { Router } from 'express'
import { createOrder, listMyOrders, listAllOrders } from '../controllers/orderController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.post('/', requireAuth, createOrder)
router.get('/me', requireAuth, listMyOrders)
router.get('/', requireAuth, requireRole('admin'), listAllOrders)

export default router

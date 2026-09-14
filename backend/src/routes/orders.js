import { Router } from 'express'
import { createOrder, listMyOrders } from '../controllers/orderController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', requireAuth, createOrder)
router.get('/me', requireAuth, listMyOrders)

export default router

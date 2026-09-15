import { Router } from 'express'
import { createBooking, listMyBookings, listAllBookings } from '../controllers/bookingController.js'
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', optionalAuth, createBooking)
router.get('/me', requireAuth, listMyBookings)
router.get('/', requireAuth, requireRole('admin'), listAllBookings)

export default router

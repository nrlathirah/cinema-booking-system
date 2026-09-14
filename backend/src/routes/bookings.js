import { Router } from 'express'
import { createBooking, listAllBookings } from '../controllers/bookingController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.post('/', requireAuth, createBooking)
router.get('/', requireAuth, requireRole('admin'), listAllBookings)

export default router

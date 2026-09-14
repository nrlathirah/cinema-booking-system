import { Router } from 'express'
import {
  listShowtimes,
  getShowtimeSeats,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} from '../controllers/showtimeController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', listShowtimes)
router.get('/:id/seats', getShowtimeSeats)
router.post('/', requireAuth, requireRole('admin'), createShowtime)
router.patch('/:id', requireAuth, requireRole('admin'), updateShowtime)
router.delete('/:id', requireAuth, requireRole('admin'), deleteShowtime)

export default router

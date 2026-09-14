import { Router } from 'express'
import { listShowtimes, getShowtimeSeats } from '../controllers/showtimeController.js'

const router = Router()

router.get('/', listShowtimes)
router.get('/:id/seats', getShowtimeSeats)

export default router

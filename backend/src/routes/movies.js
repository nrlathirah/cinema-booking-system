import { Router } from 'express'
import { getComingSoon, getMovieExtras } from '../controllers/movieController.js'

const router = Router()

router.get('/coming-soon', getComingSoon)
router.get('/:tmdbId/extras', getMovieExtras)

export default router

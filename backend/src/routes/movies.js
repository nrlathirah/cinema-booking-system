import { Router } from 'express'
import { getComingSoon } from '../controllers/movieController.js'

const router = Router()

router.get('/coming-soon', getComingSoon)

export default router

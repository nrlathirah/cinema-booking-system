import { fetchComingSoonFromTMDB } from '../utils/tmdb.js'

export async function getComingSoon(req, res) {
  const movies = await fetchComingSoonFromTMDB()
  res.json({ movies })
}

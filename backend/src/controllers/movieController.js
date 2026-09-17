import { fetchComingSoonFromTMDB, fetchMovieExtras } from '../utils/tmdb.js'

export async function getComingSoon(req, res) {
  const movies = await fetchComingSoonFromTMDB()
  res.json({ movies })
}

export async function getMovieExtras(req, res) {
  const tmdbId = Number(req.params.tmdbId)
  if (!tmdbId) {
    return res.status(400).json({ message: 'valid tmdbId is required' })
  }
  const extras = await fetchMovieExtras(tmdbId)
  res.json(extras)
}

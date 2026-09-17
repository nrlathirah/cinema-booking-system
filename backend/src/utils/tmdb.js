const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500'
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280'

export async function fetchMovieFromTMDB(title) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return null

  try {
    const searchRes = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`,
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const match = searchData.results?.[0]
    if (!match) return null

    const detailsRes = await fetch(`${TMDB_BASE}/movie/${match.id}?api_key=${apiKey}`)
    const details = detailsRes.ok ? await detailsRes.json() : {}

    return {
      posterUrl: match.poster_path ? `${TMDB_POSTER_BASE}${match.poster_path}` : null,
      backdropUrl: match.backdrop_path ? `${TMDB_BACKDROP_BASE}${match.backdrop_path}` : null,
      durationMinutes: details.runtime || null,
      genre: details.genres?.[0]?.name || null,
      overview: match.overview || null,
      rating: match.vote_average ? Math.round(match.vote_average * 10) / 10 : null,
    }
  } catch (err) {
    console.warn(`TMDB lookup failed for "${title}":`, err.message)
    return null
  }
}

let comingSoonCache = { movies: [], fetchedAt: 0 }
const COMING_SOON_TTL_MS = 6 * 60 * 60 * 1000

export async function fetchComingSoonFromTMDB() {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return []

  if (Date.now() - comingSoonCache.fetchedAt < COMING_SOON_TTL_MS) {
    return comingSoonCache.movies
  }

  try {
    const res = await fetch(`${TMDB_BASE}/movie/upcoming?api_key=${apiKey}&page=1`)
    if (!res.ok) return comingSoonCache.movies
    const data = await res.json()

    const movies = (data.results || [])
      .filter((m) => m.poster_path)
      .slice(0, 8)
      .map((m) => ({
        title: m.title,
        posterUrl: `${TMDB_POSTER_BASE}${m.poster_path}`,
        backdropUrl: m.backdrop_path ? `${TMDB_BACKDROP_BASE}${m.backdrop_path}` : null,
        overview: m.overview || null,
        releaseDate: m.release_date || null,
        rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
      }))

    comingSoonCache = { movies, fetchedAt: Date.now() }
    return movies
  } catch (err) {
    console.warn('TMDB upcoming lookup failed:', err.message)
    return comingSoonCache.movies
  }
}

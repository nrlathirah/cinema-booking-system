const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

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
      posterUrl: match.poster_path ? `${TMDB_IMAGE_BASE}${match.poster_path}` : null,
      durationMinutes: details.runtime || null,
      genre: details.genres?.[0]?.name || null,
    }
  } catch (err) {
    console.warn(`TMDB lookup failed for "${title}":`, err.message)
    return null
  }
}

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

    const detailsRes = await fetch(
      `${TMDB_BASE}/movie/${match.id}?api_key=${apiKey}&append_to_response=release_dates`,
    )
    const details = detailsRes.ok ? await detailsRes.json() : {}

    return {
      tmdbId: match.id,
      posterUrl: match.poster_path ? `${TMDB_POSTER_BASE}${match.poster_path}` : null,
      backdropUrl: match.backdrop_path ? `${TMDB_BACKDROP_BASE}${match.backdrop_path}` : null,
      durationMinutes: details.runtime || null,
      genre: details.genres?.[0]?.name || null,
      overview: match.overview || null,
      rating: match.vote_average ? Math.round(match.vote_average * 10) / 10 : null,
      tagline: details.tagline || null,
      releaseDate: details.release_date || null,
      ageRating: extractAgeRating(details.release_dates?.results),
    }
  } catch (err) {
    console.warn(`TMDB lookup failed for "${title}":`, err.message)
    return null
  }
}

function extractAgeRating(releaseDateResults) {
  if (!releaseDateResults) return null
  for (const countryCode of ['MY', 'US', 'GB']) {
    const entry = releaseDateResults.find((r) => r.iso_3166_1 === countryCode)
    const certification = entry?.release_dates?.find((d) => d.certification)?.certification
    if (certification) return certification
  }
  return null
}

let extrasCache = new Map()
const EXTRAS_TTL_MS = 24 * 60 * 60 * 1000

export async function fetchMovieExtras(tmdbId) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey || !tmdbId) return { trailerKey: null, cast: [] }

  const cached = extrasCache.get(tmdbId)
  if (cached && Date.now() - cached.fetchedAt < EXTRAS_TTL_MS) {
    return cached.data
  }

  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits,videos`,
    )
    if (!res.ok) return { trailerKey: null, cast: [] }
    const data = await res.json()

    const trailer = data.videos?.results?.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official,
    ) || data.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')

    const cast = (data.credits?.cast || []).slice(0, 6).map((c) => ({
      name: c.name,
      character: c.character || null,
      photoUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
    }))

    const result = { trailerKey: trailer?.key || null, cast }
    extrasCache.set(tmdbId, { data: result, fetchedAt: Date.now() })
    return result
  } catch (err) {
    console.warn(`TMDB extras lookup failed for id ${tmdbId}:`, err.message)
    return { trailerKey: null, cast: [] }
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
